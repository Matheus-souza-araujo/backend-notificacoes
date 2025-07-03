import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { RabbitMQService } from 'src/shared/rabbitmq.service';
import { NotificationStatusService } from './notification-status.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, RabbitMQService, NotificationStatusService],
})
export class NotificationModule {}
