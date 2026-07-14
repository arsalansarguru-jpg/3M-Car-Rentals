# 3M Car Rentals Notification Engine Manual
**Centralised NotificationService & Async Dispatch Integration Guidelines**

*Prepared by: Principal Backend Architect*

---

## 1. Notification Event Publishing API

Every operational action publishes events using `NotificationService.publishEvent(payload)`:

```typescript
import { NotificationService } from "@/services/notification.service";

// Example: Publishing Booking Confirmation
NotificationService.publishEvent({
  recipientId: "customer-uuid-1234",
  event: "booking_created",
  channels: ["Email", "SMS", "WhatsApp"],
  variables: {
    customer_name: "John Doe",
    vehicle_name: "Porsche 911 Carrera",
    booking_ref: "BK-8849"
  }
});
```

---

## 2. Dynamic Template Bindings Dictionary

Supported operational event keys and variables:

* **`booking_created`**:
  * Channels: Email, SMS, WhatsApp, Push, InApp, Slack.
  * Mapped variables: `{{customer_name}}`, `{{vehicle_name}}`, `{{booking_ref}}`.
* **`payment_completed`**:
  * Channels: Email, SMS, WhatsApp, Push, InApp, Slack.
  * Mapped variables: `{{customer_name}}`, `{{amount}}`, `{{booking_ref}}`.
* **`kyc_approved`**:
  * Channels: Email, SMS, WhatsApp, Push, InApp, Slack.
  * Mapped variables: `{{customer_name}}`.
* **`maintenance_alert`**:
  * Channels: Email, SMS, WhatsApp, Push, InApp, Slack.
  * Mapped variables: `{{vehicle_name}}`, `{{registration_number}}`, `{{odometer}}`.

---

## 3. Async Queue & Retry Strategies

The notification processor executes asynchronously in the background using these parameters:

### Exponential Backoff Settings
* **Max Attempts**: 3 retries.
* **Algorithm**: `backoffMs = Math.pow(2, retryCount - 1) * 1000` (e.g. 1s ➔ 2s ➔ 4s).
* **Fails Fallbacks**: Logs a structured `Logger.error()` message, updates the database `notifications` row status indicator to `failed` (Dead-Letter state), and fires alert monitors.
