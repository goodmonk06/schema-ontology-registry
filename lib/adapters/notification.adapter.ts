/**
 * Notification adapter interface for sending notifications
 * Implementations can send to Slack, email, webhooks, etc.
 */
export interface INotificationAdapter {
  sendNotification(message: NotificationMessage): Promise<void>;
}

export interface NotificationMessage {
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

/**
 * No-op implementation (default)
 */
export class NoOpNotificationAdapter implements INotificationAdapter {
  async sendNotification(message: NotificationMessage): Promise<void> {
    // No-op
    console.log('[NoOp Notification]', message.title, message.body);
  }
}

/**
 * Console logger implementation (for development)
 */
export class ConsoleNotificationAdapter implements INotificationAdapter {
  async sendNotification(message: NotificationMessage): Promise<void> {
    console.log(`[${message.severity.toUpperCase()}] ${message.title}`);
    console.log(message.body);
    if (message.metadata) {
      console.log('Metadata:', JSON.stringify(message.metadata, null, 2));
    }
  }
}

// Export default adapter
export const notificationAdapter: INotificationAdapter = new ConsoleNotificationAdapter();
