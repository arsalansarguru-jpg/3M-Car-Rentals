import { Logger } from "@/services/logger.service";

export interface DomainEvent {
  eventName: string;
  timestamp: string;
  payload: any;
}

export type DomainEventSubscriber = (event: DomainEvent) => void | Promise<void>;

export class DomainEventDispatcher {
  private static subscribers: Record<string, DomainEventSubscriber[]> = {};

  /**
   * Registers a subscriber callback function for a specific event key.
   */
  static subscribe(eventName: string, subscriber: DomainEventSubscriber) {
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
    }
    this.subscribers[eventName].push(subscriber);
    Logger.info(`[EventBus] Subscribed callback for event: ${eventName}`);
  }

  /**
   * Publishes an event to all registered subscriber callbacks asynchronously.
   */
  static async publish(event: DomainEvent): Promise<void> {
    const name = event.eventName;
    const list = this.subscribers[name] || [];
    
    Logger.info(`[EventBus] Publishing event: ${name} to ${list.length} subscribers`);
    
    // Execute all subscribers concurrently without blocking the main workflow thread
    const promises = list.map(async (sub) => {
      try {
        await sub(event);
      } catch (err) {
        Logger.error(`[EventBus] Subscriber failed on event: ${name}`, err);
      }
    });

    Promise.all(promises);
  }
}
