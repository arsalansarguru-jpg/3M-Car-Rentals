# 3M Car Rentals Background Worker Architecture
**Enterprise Scheduled Jobs Subsystem & Queue Processing Design Spec**

*Prepared by: Principal Backend Architect*

---

## 1. Architectural Components

To execute scheduled jobs and asynchronous background tasks without blocking web requests, we will deploy a serverless, database-backed queueing and routing framework:

```
  External HTTPS Cron Trigger (e.g. AWS EventBridge / Vercel Cron)
                                ↓
                      API Worker Controller
                                ↓
  ┌─────────────────────────────────────────────────────────────┐
  │                   Database Task Queue                       │
  │                   (public.background_jobs)                  │
  └─────────────────────────────────────────────────────────────┘
                                ↓
                      Task Processing Router
                                ↓
  ┌─────────────────────────────────────────────────────────────┐
  │                     Task Workers Suite                      │
  ├──────────────────────┬──────────────────────┬───────────────┤
  │ Insurance Reminders  │ Deposit Releases     │ Expiry Checks │
  ├──────────────────────┼──────────────────────┼───────────────┤
  │ Refund Processing    │ Booking Reminders    │ Alerts Engine │
  └──────────────────────┴──────────────────────┴───────────────┘
                                ↓
         Failure ➔ Retry (Exponential Backoff, Max 3 attempts)
                                ↓
                   Dead Letter Queue (DLQ status)
```

### Components Details

1. **Scheduler (Cron Trigger)**:
   An external scheduling coordinator (such as AWS EventBridge, Vercel Cron, or a GitHub Action) that invokes our API worker route endpoint `/api/jobs/process` on a regular schedule (e.g. hourly or daily).
2. **Database Job Queue**:
   A table `public.background_jobs` that stores job configurations, variables, schedule timings, and retry statistics.
3. **Processing Router (Background Worker)**:
   The Next.js API handler that queries pending jobs from the table, locks them to prevent concurrent runs, and delegates them to the appropriate Task Worker.
4. **Dead Letter Queue (DLQ)**:
   A fallback status state in the database table (`status = 'dead_letter'`) that captures failed tasks for administrative alerts.

---

## 2. Queue Schema Design

```sql
CREATE TYPE job_status_type AS ENUM ('pending', 'running', 'completed', 'failed', 'dead_letter');

CREATE TABLE public.background_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type text NOT NULL, -- e.g., 'insurance_reminder', 'deposit_release'
    payload jsonb DEFAULT '{}'::jsonb NOT NULL, -- Job parameters (e.g., vehicle_id, booking_id)
    status job_status_type DEFAULT 'pending' NOT NULL,
    run_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    retry_count integer DEFAULT 0 NOT NULL,
    error_log text DEFAULT null,
    locked_until timestamp with time zone DEFAULT null,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices for low-latency job picking
CREATE INDEX idx_background_jobs_status_run_at ON public.background_jobs(status, run_at) 
WHERE status = 'pending';
```

---

## 3. Task Workers Specification

Every background worker must extend a base worker layout class:

```typescript
export abstract class TaskWorker {
  abstract execute(payload: any): Promise<void>;
}
```

### Supported Task Workers

#### 1. Insurance Expiry Reminder Worker (`insurance_reminder`)
* **Frequency**: Daily.
* **Logic**: Queries `vehicle_health` records where `insurance_expiry` is within 30, 15, or 7 days.
* **Action**: Publishes `maintenance_alert` notifications via the `NotificationService`.

#### 2. Registration Certificate (RC) Expiry Worker (`rc_expiry`)
* **Frequency**: Daily.
* **Logic**: Queries `vehicle_health` records where `rc_expiry` is within 90 or 30 days.
* **Action**: Dispatches warning alerts to fleet operations teams.

#### 3. Pollution Under Control (PUC) Expiry Worker (`puc_expiry`)
* **Frequency**: Daily.
* **Logic**: Queries `vehicle_health` records where `puc_expiry` is within 15 days.
* **Action**: Dispatches warning alerts to fleet operations teams.

#### 4. Maintenance Threshold Alert Worker (`maintenance_reminder`)
* **Frequency**: Hourly.
* **Logic**: Compares current vehicle odometer values against scheduled service thresholds.
* **Action**: Updates vehicle status to `maintenance` and logs alerts.

#### 5. Escrow Deposit Releases Worker (`deposit_release`)
* **Frequency**: Hourly.
* **Logic**: Identifies completed bookings where security deposits are held beyond the 48-hour post-return cooling period.
* **Action**: Calls the bank payment gateway API to release hold funds, updates payment status, and sends receipts.

#### 6. Refund Operations Coordinator (`refund_processing`)
* **Frequency**: Hourly.
* **Logic**: Identifies cancelled bookings with pending refunds.
* **Action**: Calls payment gateways to process refunds, logs financial audits, and sends receipts.

#### 7. Upcoming Booking Reminders Worker (`booking_reminder`)
* **Frequency**: Every 15 minutes.
* **Logic**: Identifies confirmed bookings starting within the next 2 hours.
* **Action**: Sends pickup details, GPS coordinates, and safety check guidelines to customers.

---

## 4. Retries & Dead Letter Queue (DLQ) Strategies

### Exponential Backoff Retry Strategy
When a worker execution fails:
1. The job `retry_count` is incremented.
2. The job state returns to `pending`.
3. The next execution time `run_at` is delayed based on exponential backoff:
   * Attempt 1: Delay = 15 minutes.
   * Attempt 2: Delay = 1 hour.
   * Attempt 3: Delay = 4 hours.

### Dead Letter Queue Routing Strategy
When a job fails after 3 retries:
1. The job `status` is updated to `dead_letter`.
2. The error message and stack trace are logged in `error_log`.
3. The `Logger.error()` framework records the failure to trigger system alerts for manual review.
