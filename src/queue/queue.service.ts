import { Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { RabbitMQProvider } from '../queue/providers/rabbitmq.provider';
import { SQSProvider } from '../queue/providers/sqs.provider';

@Injectable()
export class QueueService implements OnModuleInit {
  constructor(
    @Optional() private readonly sqsProvider?: SQSProvider,
    @Optional() private readonly rabbitMQProvider?: RabbitMQProvider,
  ) {}

  async onModuleInit() {
    console.log('QueueService: Initializing subscriptions...');
    if (this.shouldUseSQS()) {
      await this.subscribeToSQS();
    }
    if (this.shouldUseRabbitMQ()) {
      await this.subscribeToRabbitMQ();
    }
  }

  async publishMessage(message: string): Promise<void> {
    console.log(`QueueService: Publishing message - ${message}`);
    if (this.shouldUseSQS()) {
      await this.sqsProvider?.publish(message);
    }
    if (this.shouldUseRabbitMQ()) {
      await this.rabbitMQProvider?.publish(message);
    }
  }

  private async subscribeToRabbitMQ(): Promise<void> {
    console.log('QueueService: Subscribing to RabbitMQ...');
    await this.rabbitMQProvider?.subscribe();
  }

  private async subscribeToSQS(): Promise<void> {
    console.log('QueueService: Subscribing to SQS...');
    await this.sqsProvider?.subscribe();
  }

  private shouldUseSQS(): boolean {
    return process.env.QUEUE_PROVIDER === 'BOTH' || process.env.QUEUE_PROVIDER === 'SQS';
  }

  private shouldUseRabbitMQ(): boolean {
    return process.env.QUEUE_PROVIDER === 'BOTH' || process.env.QUEUE_PROVIDER === 'RABBITMQ';
  }
}
