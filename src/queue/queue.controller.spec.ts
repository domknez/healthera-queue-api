import { Test, TestingModule } from '@nestjs/testing';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';

describe('QueueController', () => {
  let queueController: QueueController;
  let queueService: QueueService;

  const mockQueueService = {
    publishMessage: jest.fn().mockResolvedValue(undefined),
    subscribeToRabbitMQ: jest.fn().mockResolvedValue(undefined),
    subscribeToSQS: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueController],
      providers: [
        { provide: QueueService, useValue: mockQueueService },
      ],
    }).compile();

    queueController = module.get<QueueController>(QueueController);
    queueService = module.get<QueueService>(QueueService);
  });

  it('should publish a message to both queues', async () => {
    await queueController.publishMessage('Hello, Test!');
    expect(queueService.publishMessage).toHaveBeenCalledWith('Hello, Test!');
  });
});
