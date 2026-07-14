# 3M Car Rentals Domain Event Architecture
**Enterprise Event-Driven Message Bus & Decoupled Services Design Spec**

*Prepared by: Principal Backend Architect*

---

## 1. Architectural Overview

To eliminate direct service-to-service coupling (e.g. BookingService directly calling NotificationService and AuditService), we will introduce a type-safe **Domain Event Dispatcher (Event Bus)**. Services will publish events to this bus, and registered subscribers will consume and react to them asynchronously.

```
  ┌─────────────────────────────────────────────────────────────┐
  │                        Event Publisher                      │
  │                      (e.g., BookingService)                 │
  └─────────────────────────────────────────────────────────────┘
                                ↓
                    DomainEventDispatcher.publish()
                                ↓
  ┌─────────────────────────────────────────────────────────────┐
  │                    Domain Event Bus (In-Memory)             │
  │                    (Future: RabbitMQ / Redis PubSub)        │
  └─────────────────────────────────────────────────────────────┘
                                ↓
        - BookingCreated         - VehicleCheckedOut
        - BookingCancelled       - VehicleReturned
        - PaymentCompleted       - CustomerVerified
        - MaintenanceCompleted
                                ↓
  ┌─────────────────────────────────────────────────────────────┐
  │                 Event Subscribers / Handlers                │
  ├──────────────────────┬──────────────────────┬───────────────┤
  │ NotificationSub      │ AuditLogSub          │ LedgerSub     │
  └──────────────────────┴──────────────────────┴───────────────┘
```

---

## 2. Event Interface Specifications

Every Domain Event will inherit from a base `IDomainEvent` interface:

```typescript
export interface IDomainEvent<T = any> {
  id: string; // Unique event instance UUID
  occurredAt: Date; // Timestamp in UTC
  eventName: string; // Event type identifier
  payload: T; // Strongly-typed event data
}
```

### Supported Domain Events & Payloads

#### 1. `BookingCreated` Event
* **Event Name**: `booking.created`
* **Payload Structure**:
  ```typescript
  interface BookingCreatedPayload {
    bookingId: string;
    bookingReference: string;
    customerId: string;
    vehicleId: string;
    totalAmount: number;
    pickupDatetime: string;
  }
  ```

#### 2. `BookingCancelled` Event
* **Event Name**: `booking.cancelled`
* **Payload Structure**:
  ```typescript
  interface BookingCancelledPayload {
    bookingId: string;
    bookingReference: string;
    customerId: string;
    refundAmount: number;
    reason: string;
  }
  ```

#### 3. `VehicleCheckedOut` Event
* **Event Name**: `vehicle.checked_out`
* **Payload Structure**:
  ```typescript
  interface VehicleCheckedOutPayload {
    vehicleId: string;
    bookingId: string;
    odometer: number;
    fuelLevel: number;
    operatorEmail: string;
  }
  ```

#### 4. `VehicleReturned` Event
* **Event Name**: `vehicle.returned`
* **Payload Structure**:
  ```typescript
  interface VehicleReturnedPayload {
    vehicleId: string;
    bookingId: string;
    odometer: number;
    fuelLevel: number;
    cleanlinessStatus: string;
    operatorEmail: string;
  }
  ```

#### 5. `MaintenanceCompleted` Event
* **Event Name**: `maintenance.completed`
* **Payload Structure**:
  ```typescript
  interface MaintenanceCompletedPayload {
    vehicleId: string;
    logId: string;
    serviceType: string;
    totalCost: number;
    completedAt: string;
  }
  ```

#### 6. `CustomerVerified` Event
* **Event Name**: `customer.verified`
* **Payload Structure**:
  ```typescript
  interface CustomerVerifiedPayload {
    customerId: string;
    licenseNumber: string;
    verifiedBy: string;
    verifiedAt: string;
  }
  ```

#### 7. `PaymentCompleted` Event
* **Event Name**: `payment.completed`
* **Payload Structure**:
  ```typescript
  interface PaymentCompletedPayload {
    paymentId: string;
    bookingId: string;
    amount: number;
    gatewayReference: string;
    paymentMethod: string;
  }
  ```

---

## 3. Event Dispatcher & Subscribers Architecture

### The Central Event Dispatcher
The dispatcher acts as the central event broker, maintaining a registry of event names and their active subscribers:

```typescript
export type SubscriberCallback<T = any> = (event: IDomainEvent<T>) => Promise<void> | void;

export class DomainEventDispatcher {
  private static subscribers: Map<string, SubscriberCallback[]> = new Map();

  /**
   * Registers a subscriber callback for a specific event type.
   */
  static subscribe<T = any>(eventName: string, callback: SubscriberCallback<T>): void {
    const list = this.subscribers.get(eventName) || [];
    list.push(callback);
    this.subscribers.set(eventName, list);
  }

  /**
   * Publishes an event to all registered subscribers.
   */
  static async publish<T = any>(event: IDomainEvent<T>): Promise<void> {
    const callbacks = this.subscribers.get(event.eventName) || [];
    
    // Execute callbacks asynchronously to prevent blocking the publisher
    for (const callback of callbacks) {
      try {
        await Promise.resolve(callback(event));
      } catch (err) {
        console.error(`[EventDispatcher] Subscriber error on event: ${event.eventName}`, err);
      }
    }
  }
}
```

### Defining Subscribers
Subscribers register with the dispatcher and respond to specific events:

```typescript
// 1. Audit Log Subscriber
DomainEventDispatcher.subscribe("booking.created", async (event: IDomainEvent<BookingCreatedPayload>) => {
  await AuditService.logAudit({
    userEmail: "system",
    userRole: "system",
    action: "create_booking",
    entity: "bookings",
    entityId: event.payload.bookingId,
    newValue: event.payload
  });
});

// 2. Notification Dispatcher Subscriber
DomainEventDispatcher.subscribe("booking.created", async (event: IDomainEvent<BookingCreatedPayload>) => {
  await NotificationService.publishEvent({
    recipientId: event.payload.customerId,
    event: "booking_created",
    channels: ["Email", "WhatsApp"],
    variables: {
      booking_ref: event.payload.bookingReference
    }
  });
});
```
