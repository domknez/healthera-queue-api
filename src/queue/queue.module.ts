import { Module, DynamicModule } from '@nestjs/common';
// import { QueueService } from './queue.service';
import { SQSProvider } from './providers/sqs.provider';
import { RabbitMQProvider } from './providers/rabbitmq.provider';
import { QueueService } from 'src/queue/queue.service';

@Module({})
export class QueueModule {
  static forRoot(): DynamicModule {
    const provider =
      process.env.QUEUE_PROVIDER === 'SQS' ? SQSProvider : RabbitMQProvider;

    return {
      module: QueueModule,
      providers: [provider, QueueService],
      exports: [QueueService],
    };
  }
}
