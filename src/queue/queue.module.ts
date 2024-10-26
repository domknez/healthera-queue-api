import { DynamicModule, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { SQSProvider } from './providers/sqs.provider';
import { RabbitMQProvider } from './providers/rabbitmq.provider';
import { QueueController } from './queue.controller';

const QUEUE_PROVIDER_TOKEN = 'QUEUE_PROVIDER_TOKEN';

@Module({})
export class QueueModule {
  static forRoot(): DynamicModule {
    const provider =
      process.env.QUEUE_PROVIDER === 'SQS' ? SQSProvider : RabbitMQProvider;

    return {
      module: QueueModule,
      controllers: [QueueController],  // Register QueueController here
      providers: [
        {
          provide: QUEUE_PROVIDER_TOKEN,
          useClass: provider,
        },
        QueueService,
      ],
      exports: [QueueService],
    };
  }
}
