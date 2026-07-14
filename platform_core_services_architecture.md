# 3M Car Rentals Platform Core Services Manual
**Master Enterprise Architecture Specifications & Shared Services Definitions**

*Prepared by: Office of the Principal Platform Architect*

---

## 1. Workflow Engine (State Orchestrator)

* **Concept**: Eliminates hardcoded status changes by introducing a centralized state transition schema. Enables configuring multiple paths based on business criteria.
* **Database Schema (JSONB / Relational)**:
  ```sql
  CREATE TABLE public.workflow_definitions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      entity_type text NOT NULL, -- 'booking', 'maintenance', 'kyc'
      category text NOT NULL,    -- 'luxury', 'economy'
      steps jsonb NOT NULL,      -- Array of status strings
      transitions jsonb NOT NULL,-- Valid transition mapping paths
      created_at timestamptz DEFAULT now()
  );
  ```
* **API Specification**:
  * `PATCH /api/core/workflow/transition`: Payload `{ entityId, currentStatus, targetStatus }` checked dynamically against active transition schema mappings.

---

## 2. Rules Engine (Decision Matrix)

* **Concept**: Dynamically evaluates conditional operators and runs automated operational alerts.
* **DSL JSON Representation**:
  ```json
  {
    "rule_name": "VIP_Zero_Deposit",
    "conditions": [
      { "field": "booking_value", "operator": "greater_than", "value": 5000 },
      { "field": "customer_tier", "operator": "equals", "value": "VIP" }
    ],
    "actions": [
      { "target": "deposit_amount", "mutation": "set_value", "value": 0 },
      { "target": "notify", "channel": "Slack", "recipient": "finance-ops" }
    ]
  }
  ```
* **API Hook**:
  * `POST /api/core/rules/evaluate`: Evaluates input objects and returns a mutator execution plan.

---

## 3. Forms Engine (Dynamic Survey Engine)

* **Concept**: Defines checklists and inspection parameters using JSON field configurations rather than front-end markup.
* **JSON Schema Structure**:
  ```json
  {
    "form_name": "Pre-Release Inspection Checklist",
    "fields": [
      { "id": "fuel_pct", "label": "Fuel Charge Percentage", "type": "number", "required": true },
      { "id": "scratch_map", "label": "Damages Drawing", "type": "coordinates_map", "required": false },
      { "id": "inspection_photo", "label": "Gate Photo", "type": "file_upload", "required": true }
    ]
  }
  ```

---

## 4. Document Engine (PDF & Agreement Templating)

* **Concept**: Compiles, signs, and distributes platform invoices and rental agreements using variables interpolation.
* **Workflow Sequence**:
  1. Compile template Markdown variables (e.g. `{{renter_name}}`, `{{checkout_odometer}}`).
  2. Convert Markdown text stream to PDF bytes.
  3. Store in the File Management platform.
  4. Publish to the Notification Engine for immediate client dispatch.

---

## 5. Global Search Engine (Elastic-Mock Indexer)

* **Concept**: A centralized indexer that resolves search strings across vehicles, bookings, customers, and invoices.
* **Search Gateway Interface**:
  ```typescript
  export interface SearchNode {
    entityType: "vehicle" | "booking" | "customer" | "payment";
    entityId: string;
    displayTitle: string;
    tags: string[]; // ['GA01AA1001', 'swift', 'active']
  }
  ```
* **Query API**:
  * `GET /api/core/search?q=GA01AA`: Query matches tokens and returns search nodes.

---

## 6. Universal Timeline Engine

* **Concept**: Consolidates operation audits, status transitions, notifications, and telemetry into a single chronological stream.
* **PostgreSQL Schema**:
  ```sql
  CREATE TABLE public.universal_timeline (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      entity_type text NOT NULL, -- 'vehicle', 'customer', 'booking'
      entity_id uuid NOT NULL,
      actor_name text NOT NULL,
      event_type text NOT NULL,  -- 'status_change', 'payment_captured', 'audit'
      payload jsonb NOT NULL,
      timestamp timestamptz DEFAULT now()
  );
  ```

---

## 7. File Management Platform

* **Concept**: Unified upload gateway providing virus scanning, image compression, and document expiry parameters.
* **Features**:
  * **Compression**: Automatively scales high-resolution inspection photos before saving.
  * **TTL Gating**: Automatically expires temporary gate passes after 48 hours.

---

## 8. Scheduler Engine (Cron Coordinator)

* **Concept**: Core scheduler managing timed events (e.g., daily PUC reviews, booking check-out reminders).
* **Interface**: Registers cron jobs and dispatches background workers.
  ```typescript
  class SchedulerEngine {
    static registerJob(cronExpression: string, targetService: string, payload: any): void;
  }
  ```

---

## 9. Reporting & Export Engine

* **Concept**: Aggregates business data and exports CSV or Excel documents asynchronously to prevent timeout errors.
* **API Specifications**:
  * `POST /api/core/reports/export`: Payload defines parameters, runs in the background, and updates status to `completed` with a download URL.

---

## 10. AI Integration Layer (Model Gateway)

* **Concept**: Isolates LLM client keys and formats input prompts to generate summaries and predictive metrics.
* **Gateway Interface**:
  ```typescript
  export class AICoreGateway {
    static async generateSummary(context: string): Promise<string>;
    static async predictMaintenance(history: any[]): Promise<{ probability: number; reason: string }>;
  }
  ```
