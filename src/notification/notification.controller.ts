import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('notificar')
  notificar(@Body() dto: CreateNotificationDto, @Res() res) {
    this.notificationService.enfileirar(dto);
    return res.status(HttpStatus.ACCEPTED).json({ mensagemId: dto.mensagemId });
  }

  @Get('notificacao/status/:id')
  getStatus(@Param('id') id: string) {
    return this.notificationService.getStatus(id);
  }
}
