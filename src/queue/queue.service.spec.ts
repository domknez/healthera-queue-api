// src/queue/queue.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { QueueModule } from './queue.module';
import { SQSProvider } from './providers/sqs.provider';
import { RabbitMQProvider } from './providers/rabbitmq.provider';

describe('QueueService', () => {

  let queueService: QueueService;

  const runTestsForProvider = (provider: 'SQS' | 'RABBITMQ') => {
    beforeEach(async () => {
      // Set environment variable to select the provider dynamically
      process.env.QUEUE_PROVIDER = provider;

      const module: TestingModule = await Test.createTestingModule({
        imports: [QueueModule.forRoot()],
      }).compile();

      queueService = module.get<QueueService>(QueueService);
    });

    it(`should be defined when using ${provider} provider`, () => {
      expect(queueService).toBeDefined();
    });

    it(`should publish a message using the ${provider} provider`, async () => {
      // Mock the publish function to verify it was called
      const publishSpy = jest.spyOn(queueService['queueProvider'], 'publish').mockImplementation(async () => {});

      await queueService.publishMessage('Test message');
      expect(publishSpy).toHaveBeenCalledWith('Test message');

      // Clean up mock
      publishSpy.mockRestore();
    });

    it(`should initialize subscription on module init for ${provider} provider`, async () => {
      const subscribeSpy = jest.spyOn(queueService['queueProvider'], 'subscribe').mockImplementation(async () => {});

      await queueService.onModuleInit();
      expect(subscribeSpy).toHaveBeenCalled();

      // Clean up mock
      subscribeSpy.mockRestore();
    });
  };

  describe('Using SQSProvider', () => {
    runTestsForProvider('SQS');
  });

  describe('Using RabbitMQProvider', () => {
    runTestsForProvider('RABBITMQ');
  });
});
