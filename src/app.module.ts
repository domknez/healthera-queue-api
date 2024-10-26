import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [QueueModule.forRoot()],
})
export class AppModule {}
