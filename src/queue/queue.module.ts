import { DynamicModule, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { SQSProvider } from './providers/sqs.provider';
import { RabbitMQProvider } from './providers/rabbitmq.provider';
import { QueueController } from './queue.controller';

@Module({})
export class QueueModule {
  static forRoot(): DynamicModule {
    const providers = [];

    switch (process.env.QUEUE_PROVIDER.toUpperCase()) {
      case 'BOTH':
        providers.push(SQSProvider, RabbitMQProvider);
        break;
      case 'SQS':
        providers.push(SQSProvider);
        break;
      case 'RABBITMQ':
        providers.push(RabbitMQProvider);
        break;
      default:
        throw new Error(
          "Invalid QUEUE_PROVIDER. Set it to 'SQS', 'RABBITMQ', or 'BOTH'.",
        );
    }

    return {
      module: QueueModule,
      controllers: [QueueController],
      providers: [QueueService, ...providers],
      exports: [QueueService],
    };
  }
}
