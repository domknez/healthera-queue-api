import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { SQSProvider } from './providers/sqs.provider';
import { RabbitMQProvider } from './providers/rabbitmq.provider';

jest.mock('./providers/sqs.provider');
jest.mock('./providers/rabbitmq.provider');

describe('QueueService', () => {
  let queueService: QueueService;
  let sqsProvider: SQSProvider;
  let rabbitMQProvider: RabbitMQProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueService, SQSProvider, RabbitMQProvider],
    }).compile();

    queueService = module.get<QueueService>(QueueService);
    sqsProvider = module.get<SQSProvider>(SQSProvider);
    rabbitMQProvider = module.get<RabbitMQProvider>(RabbitMQProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.QUEUE_PROVIDER;
  });

  describe('publishMessage', () => {
    it('should publish to both queues when QUEUE_PROVIDER is BOTH', async () => {
      process.env.QUEUE_PROVIDER = 'BOTH';
      const message = 'Test message';

      await queueService.publishMessage(message);

      expect(sqsProvider.publish).toHaveBeenCalledWith(message);
      expect(rabbitMQProvider.publish).toHaveBeenCalledWith(message);
    });

    it('should publish only to SQS when QUEUE_PROVIDER is SQS', async () => {
      process.env.QUEUE_PROVIDER = 'SQS';
      const message = 'Test message';

      await queueService.publishMessage(message);

      expect(sqsProvider.publish).toHaveBeenCalledWith(message);
      expect(rabbitMQProvider.publish).not.toHaveBeenCalled();
    });

    it('should publish only to RabbitMQ when QUEUE_PROVIDER is RABBITMQ', async () => {
      process.env.QUEUE_PROVIDER = 'RABBITMQ';
      const message = 'Test message';

      await queueService.publishMessage(message);

      expect(rabbitMQProvider.publish).toHaveBeenCalledWith(message);
      expect(sqsProvider.publish).not.toHaveBeenCalled();
    });
  });

  describe('onModuleInit', () => {
    it('should subscribe to both queues when QUEUE_PROVIDER is BOTH', async () => {
      process.env.QUEUE_PROVIDER = 'BOTH';

      await queueService.onModuleInit();

      expect(sqsProvider.subscribe).toHaveBeenCalled();
      expect(rabbitMQProvider.subscribe).toHaveBeenCalled();
    });

    it('should subscribe only to SQS when QUEUE_PROVIDER is SQS', async () => {
      process.env.QUEUE_PROVIDER = 'SQS';

      await queueService.onModuleInit();

      expect(sqsProvider.subscribe).toHaveBeenCalled();
      expect(rabbitMQProvider.subscribe).not.toHaveBeenCalled();
    });

    it('should subscribe only to RabbitMQ when QUEUE_PROVIDER is RABBITMQ', async () => {
      process.env.QUEUE_PROVIDER = 'RABBITMQ';

      await queueService.onModuleInit();

      expect(rabbitMQProvider.subscribe).toHaveBeenCalled();
      expect(sqsProvider.subscribe).not.toHaveBeenCalled();
    });
  });
});
