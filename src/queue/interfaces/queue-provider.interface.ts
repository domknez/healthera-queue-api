export interface QueueProvider {
  publish(message: string): Promise<void>;
  subscribe(): Promise<void>;
}
