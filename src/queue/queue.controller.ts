import { Body, Controller, Post, Get } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('publish')
  async publishMessage(@Body('message') message: string): Promise<{ success: boolean }> {
    await this.queueService.publishMessage(message);
    return { success: true };
  }

  @Get('subscribe')
  async subscribeToMessages(): Promise<{ success: boolean }> {
    await this.queueService.subscribeToMessages();
    return { success: true };
  }

  @Get('receive')
  async receiveMessage(): Promise<any> {
    const messages = await this.queueService.receiveMessages();
    return { messages };
  }
}
