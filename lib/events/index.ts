import { EventEmitter } from 'events';
import { logger } from '@/lib/logger';

// Domain event types
export interface DomainEvent {
  timestamp: Date;
  [key: string]: any;
}

export interface SchemaCreatedEvent extends DomainEvent {
  schemaId: string;
  namespaceKey: string;
  version: string;
  type: string;
  author?: string;
}

export interface SchemaPublishedEvent extends DomainEvent {
  schemaId: string;
  namespaceKey: string;
  version: string;
}

export interface SchemaDeprecatedEvent extends DomainEvent {
  schemaId: string;
  namespaceKey: string;
  version: string;
}

export interface SchemaDeletedEvent extends DomainEvent {
  schemaId: string;
  namespaceKey: string;
  version: string;
}

export interface NamespaceCreatedEvent extends DomainEvent {
  namespaceId: string;
  key: string;
  name: string;
}

// Event handler type
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

/**
 * Simple event bus for domain events
 */
class EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100); // Increase for production
  }

  /**
   * Emit an event
   */
  emit<T extends DomainEvent>(eventName: string, data: Omit<T, 'timestamp'>): void {
    const event = {
      ...data,
      timestamp: new Date(),
    } as T;

    logger.debug({ eventName, event }, 'Emitting domain event');

    // Emit synchronously
    this.emitter.emit(eventName, event);

    // Also emit to wildcard listeners
    this.emitter.emit('*', eventName, event);
  }

  /**
   * Subscribe to an event
   */
  on<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): void {
    this.emitter.on(eventName, async (event: T) => {
      try {
        await handler(event);
      } catch (error) {
        logger.error(
          { error, eventName, event },
          'Error handling domain event'
        );
      }
    });
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: (eventName: string, event: DomainEvent) => void | Promise<void>): void {
    this.on('*', async (eventName: string, event: DomainEvent) => {
      try {
        await handler(eventName, event);
      } catch (error) {
        logger.error({ error, eventName }, 'Error in wildcard event handler');
      }
    });
  }

  /**
   * Subscribe to an event once
   */
  once<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): void {
    this.emitter.once(eventName, handler);
  }

  /**
   * Remove event listener
   */
  off(eventName: string, handler: EventHandler): void {
    this.emitter.off(eventName, handler);
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(eventName?: string): void {
    this.emitter.removeAllListeners(eventName);
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Register default event handlers
eventBus.onAny((eventName, event) => {
  logger.info({ eventName, event }, 'Domain event occurred');
});
