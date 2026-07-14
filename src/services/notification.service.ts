import { supabaseAdmin } from "@/lib/supabase-admin";
import { Logger } from "./logger.service";

export type NotificationChannel = "Email" | "SMS" | "WhatsApp" | "Push" | "InApp" | "Slack";

export type NotificationEvent = "booking_created" | "payment_completed" | "kyc_approved" | "maintenance_alert";

export interface NotificationPayload {
  recipientId: string;
  event: NotificationEvent;
  variables: Record<string, string>;
  channels: NotificationChannel[];
}

interface QueueItem {
  id: string;
  recipientId: string;
  event: NotificationEvent;
  channel: NotificationChannel;
  title: string;
  body: string;
  retryCount: number;
}

// ─── Notification Templates Configurations ────────────────────────────────────

const TEMPLATE_STORE: Record<
  NotificationEvent,
  Record<NotificationChannel, { title: string; body: string }>
> = {
  booking_created: {
    Email: {
      title: "Booking Confirmed - 3M Car Rentals",
      body: "Hello {{customer_name}}, your booking for {{vehicle_name}} has been confirmed. Booking Reference: {{booking_ref}}."
    },
    SMS: {
      title: "Booking Confirmed",
      body: "3M Rentals: Booking Confirmed for {{vehicle_name}} (Ref: {{booking_ref}}). Enjoy your premium drive!"
    },
    WhatsApp: {
      title: "Booking Confirmed ✅",
      body: "*Hello {{customer_name}}!* Your booking for the *{{vehicle_name}}* is confirmed (Ref: *{{booking_ref}}*)."
    },
    Push: {
      title: "Ride Confirmed!",
      body: "Your reservation for {{vehicle_name}} is secured."
    },
    InApp: {
      title: "Booking Confirmed",
      body: "Your booking for {{vehicle_name}} (Ref: {{booking_ref}}) is confirmed."
    },
    Slack: {
      title: "Booking Created Alert",
      body: "[Operations]: Booking created by {{customer_name}} for {{vehicle_name}} (Ref: {{booking_ref}})."
    }
  },
  payment_completed: {
    Email: {
      title: "Receipt for Booking {{booking_ref}}",
      body: "Hello {{customer_name}}, we received your payment of {{amount}} for booking {{booking_ref}}."
    },
    SMS: {
      title: "Payment Received",
      body: "3M Rentals: Payment of {{amount}} received for booking {{booking_ref}}."
    },
    WhatsApp: {
      title: "Payment Confirmed 💳",
      body: "*Hello {{customer_name}}!* We received payment of *{{amount}}* for booking *{{booking_ref}}*."
    },
    Push: {
      title: "Payment Received",
      body: "Receipt of {{amount}} confirmed for ride {{booking_ref}}."
    },
    InApp: {
      title: "Payment Complete",
      body: "Payment of {{amount}} received for booking {{booking_ref}}."
    },
    Slack: {
      title: "Financial Ledger Alert",
      body: "[Finance]: Payment of {{amount}} received for booking {{booking_ref}}."
    }
  },
  kyc_approved: {
    Email: {
      title: "KYC Documents Approved - 3M Car Rentals",
      body: "Hello {{customer_name}}, your driving license documents have been verified. You can now drive the fleet."
    },
    SMS: {
      title: "KYC Verified",
      body: "3M Rentals: Your KYC profile is verified. You are clear to drive!"
    },
    WhatsApp: {
      title: "KYC Approved 🛡️",
      body: "*Hello {{customer_name}}!* Your driver's documents are approved. You are ready to drive our luxury fleet."
    },
    Push: {
      title: "KYC Approved",
      body: "Verification checks passed. Enjoy your ride!"
    },
    InApp: {
      title: "KYC Verification Cleared",
      body: "Your driver's documents have been successfully verified."
    },
    Slack: {
      title: "KYC Verification Alert",
      body: "[Verification]: KYC cleared for customer {{customer_name}}."
    }
  },
  maintenance_alert: {
    Email: {
      title: "Vehicle Maintenance Required",
      body: "Warning: Vehicle {{vehicle_name}} (Reg: {{registration_number}}) requires immediate maintenance. Odometer: {{odometer}} KM."
    },
    SMS: {
      title: "Maintenance Alert",
      body: "Alert: Vehicle {{vehicle_name}} requires maintenance check (Odo: {{odometer}} KM)."
    },
    WhatsApp: {
      title: "Maintenance Alert ⚠️",
      body: "*Alert:* Vehicle *{{vehicle_name}}* is due for service check. Odometer: *{{odometer}}* KM."
    },
    Push: {
      title: "Service Check Alert",
      body: "Vehicle {{vehicle_name}} requires attention."
    },
    InApp: {
      title: "Maintenance Service Required",
      body: "Vehicle {{vehicle_name}} (Reg: {{registration_number}}) needs service check."
    },
    Slack: {
      title: "Operations Alert",
      body: "[Fleet]: Vehicle {{vehicle_name}} (Reg: {{registration_number}}) has been flagged for maintenance (Odo: {{odometer}} KM)."
    }
  }
};

// ─── Notification Engine Service ──────────────────────────────────────────────

export class NotificationService {
  private static queue: QueueItem[] = [];
  private static processing = false;
  private static maxRetries = 3;

  /**
   * Publishes an event to trigger background notification deliveries.
   */
  static publishEvent(payload: NotificationPayload) {
    Logger.info("Notification event published.", {
      context: { service: "NotificationService", action: "publishEvent" },
      meta: { event: payload.event, recipientId: payload.recipientId }
    });

    payload.channels.forEach((channel) => {
      const template = TEMPLATE_STORE[payload.event]?.[channel];
      if (!template) {
        Logger.warn(`Template mapping missing for event: ${payload.event} on channel: ${channel}`);
        return;
      }

      // Compile template variables
      let title = template.title;
      let body = template.body;

      Object.entries(payload.variables).forEach(([key, val]) => {
        title = title.replace(new RegExp(`{{${key}}}`, "g"), val);
        body = body.replace(new RegExp(`{{${key}}}`, "g"), val);
      });

      // Add to background processing queue
      const queueItem: QueueItem = {
        id: crypto.randomUUID(),
        recipientId: payload.recipientId,
        event: payload.event,
        channel,
        title,
        body,
        retryCount: 0
      };

      NotificationService.queue.push(queueItem);
    });

    NotificationService.processQueue();
  }

  /**
   * Background queue processor.
   */
  private static async processQueue() {
    if (NotificationService.processing || NotificationService.queue.length === 0) return;
    NotificationService.processing = true;

    while (NotificationService.queue.length > 0) {
      const item = NotificationService.queue.shift()!;
      await NotificationService.dispatchWithRetry(item);
    }

    NotificationService.processing = false;
  }

  /**
   * Dispatch wrapper utilizing exponential backoff retry parameters.
   */
  private static async dispatchWithRetry(item: QueueItem) {
    let success = false;
    
    // Create initial row entry in notifications audit table (marked pending)
    const { data: dbEntry } = await supabaseAdmin
      .from("notifications")
      .insert({
        recipient_id: item.recipientId,
        notification_type: item.event === "booking_created" 
          ? "BookingConfirmation" 
          : item.event === "payment_completed" 
            ? "PaymentReceipt" 
            : item.event === "kyc_approved" 
              ? "PickupReminder" 
              : "MaintenanceAlert",
        delivery_channel: item.channel === "Push" || item.channel === "InApp" || item.channel === "Slack" 
          ? "Email" // Map onto supported enum schema channels
          : item.channel,
        status: "pending"
      })
      .select("id")
      .single();

    const entryId = dbEntry?.id;

    while (item.retryCount <= NotificationService.maxRetries) {
      try {
        // Dispatch call simulated mockup
        await NotificationService.sendToChannel(item.channel, item.title, item.body);
        success = true;
        break;
      } catch (err) {
        item.retryCount++;
        if (item.retryCount > NotificationService.maxRetries) {
          break;
        }

        // Exponential delay: 1s, 2s, 4s
        const backoffMs = Math.pow(2, item.retryCount - 1) * 1000;
        Logger.warn(`Notification dispatch failed. Retrying in ${backoffMs}ms…`, {
          context: { service: "NotificationService", action: "retry" },
          meta: { queueItemId: item.id, attempt: item.retryCount }
        });
        await new Promise((res) => setTimeout(res, backoffMs));
      }
    }

    if (success) {
      Logger.info("Notification delivered successfully.", {
        context: { service: "NotificationService", action: "deliverySuccess" },
        meta: { event: item.event, channel: item.channel }
      });

      if (entryId) {
        await supabaseAdmin
          .from("notifications")
          .update({ status: "delivered", sent_at: new Date().toISOString() })
          .eq("id", entryId);
      }
    } else {
      // Dead-Letter Strategy
      Logger.error(`Notification failed delivery after ${NotificationService.maxRetries} attempts. Routing to Dead-Letter.`, new Error("Max retries exhausted"), {
        context: { service: "NotificationService", action: "deliveryFailure" },
        meta: { event: item.event, channel: item.channel, recipientId: item.recipientId }
      });

      if (entryId) {
        await supabaseAdmin
          .from("notifications")
          .update({ status: "failed" })
          .eq("id", entryId);
      }
    }
  }

  /**
   * Low-level channel integrations simulation mockups.
   */
  private static async sendToChannel(channel: NotificationChannel, title: string, body: string): Promise<void> {
    // Simulated connection delays
    await new Promise((res) => setTimeout(res, 300));
    
    // Simulate random mock network fail spikes (15% chance of failure to test retries)
    if (Math.random() < 0.15) {
      throw new Error("Temporary network timeout resolving channel endpoint.");
    }
  }
}

// Register subscribers for Domain Events to make NotificationService event-driven
import { DomainEventDispatcher } from "@/lib/event-bus";

DomainEventDispatcher.subscribe("BookingCreated", (event) => {
  NotificationService.publishEvent({
    recipientId: event.payload.userId,
    event: "booking_created",
    variables: {
      customer_name: event.payload.customerName || "Customer",
      vehicle_name: event.payload.vehicleName || "Vehicle",
      booking_ref: event.payload.bookingRef || "REF"
    },
    channels: ["Email", "SMS", "WhatsApp", "InApp"]
  });
});

DomainEventDispatcher.subscribe("PaymentCompleted", (event) => {
  NotificationService.publishEvent({
    recipientId: event.payload.userId,
    event: "payment_completed",
    variables: {
      customer_name: event.payload.customerName || "Customer",
      amount: String(event.payload.amount || 0),
      booking_ref: event.payload.bookingRef || "REF"
    },
    channels: ["Email", "SMS", "InApp"]
  });
});
