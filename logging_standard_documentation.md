# 3M Car Rentals Structured Logging Manual
**Company-Wide Logging Specifications & JSON Output Standards**

*Prepared by: Principal Backend Architect*

---

## 1. Severity & Category Definitions

Every logged message must select the most specific level indicator:

* **`Logger.info(message, payload)`**: For standard operational confirmations (e.g. system setups, index validations).
* **`Logger.warn(message, payload)`**: For recoverable failures (e.g. non-critical api retry loops, rate limits hits).
* **`Logger.error(message, error, payload)`**: For application crashes or failed database transactions. Always include the `Error` instance.
* **`Logger.security(message, payload)`**: For authorization anomalies (e.g. unauthorized route accesses, blocked requests).
* **`Logger.audit(message, payload)`**: For recording user data mutations. Always include `old_value` and `new_value` in metadata.
* **`Logger.performance(message, durationMs, payload)`**: For mapping action runtimes, slow database indexes queries, or network delays.

---

## 2. JSON Logs Format Shape

Production logs are formatted as single-line JSON statements, allowing automated collectors to ingest and index keys easily:

```json
{
  "timestamp": "2026-07-14T03:06:31.000Z",
  "level": "INFO",
  "environment": "production",
  "message": "Verify check in logs committed.",
  "context": {
    "service": "FleetService",
    "action": "checkIn"
  },
  "meta": {
    "vehicle_id": "893c8a9a-5f06-444c-bc67-0c7f8a9a6f3b",
    "dispatch_id": "112f8a9a-5f06-444c-bc67-0c7f8a9a6f3c"
  }
}
```

---

## 3. Usage & Integration Code Snippets

```typescript
import { Logger } from "@/services/logger.service";

// 1. Logging Info
Logger.info("Database connection established successfully.", {
  context: { service: "DatabaseClient", action: "connect" }
});

// 2. Logging Errors
try {
  await db.insert(booking);
} catch (err) {
  Logger.error("Failed to insert booking record.", err, {
    context: { service: "BookingService", action: "create" },
    meta: { booking_ref: "BK-9999" }
  });
}

// 3. Performance Metrics Tracking
const start = Date.now();
const result = await fetchReportsData();
const duration = Date.now() - start;

Logger.performance("BI Reports query executed.", duration, {
  context: { service: "ReportService", action: "query" }
});

// 4. Mutation Audits Tracking
Logger.audit("Vehicle status updated.", {
  context: { service: "FleetService", action: "updateStatus" },
  meta: {
    vehicle_id: "vehicle-123",
    old_value: "maintenance",
    new_value: "available",
    operator: "admin@3mrentals.com"
  }
});
```
