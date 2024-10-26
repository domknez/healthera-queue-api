import { Controller, Post, Body, Get } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('publish')
  async publishMessage(@Body('message') message: string): Promise<{ success: boolean }> {
    console.log(`QueueController: Received request to publish message - ${message}`);
    await this.queueService.publishMessage(message);
    return { success: true };
  }

  @Get('subscribe')
  async subscribeToMessages(): Promise<{ success: boolean }> {
    console.log('QueueController: Received request to subscribe...');
    await this.queueService.onModuleInit();
    return { success: true };
  }
}
