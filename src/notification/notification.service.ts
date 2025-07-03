import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationStatusService } from './notification-status.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { RabbitMQService } from 'src/shared/rabbitmq.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private readonly filaEntrada =
    process.env.RMQ_FILA_ENTRADA || 'fila.notificacao.entrada.matheus';
  private readonly filaStatus =
    process.env.RMQ_FILA_STATUS || 'fila.notificacao.status.matheus';

  constructor(
    private readonly rabbitService: RabbitMQService,
    private readonly statusService: NotificationStatusService,
  ) {}

  async onModuleInit() {
    const channel = await this.rabbitService.connect();

    await channel.assertQueue(this.filaEntrada);
    await channel.assertQueue(this.filaStatus);

    channel.consume(this.filaEntrada, async (msg) => {
      try {
        if (!msg) return;
        const data = JSON.parse(msg.content.toString());

        // Simula processamento com atraso aleatório
        await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));

        const falha = Math.floor(Math.random() * 10) < 2;
        const status = falha ? 'FALHA_PROCESSAMENTO' : 'PROCESSADO_SUCESSO';

        this.statusService.setStatus(data.mensagemId, status);

        channel.sendToQueue(
          this.filaStatus,
          Buffer.from(JSON.stringify({ mensagemId: data.mensagemId, status })),
        );

        channel.ack(msg);
        this.logger.log(`Mensagem ${data.mensagemId} processada: ${status}`);
      } catch (error) {
        this.logger.error('Erro ao processar mensagem da fila', error);
      }
    });
  }

  async enfileirar(dto: CreateNotificationDto) {
    const channel = await this.rabbitService.connect();
    const buffer = Buffer.from(JSON.stringify(dto));

    channel.sendToQueue(this.filaEntrada, buffer);
    this.statusService.setStatus(dto.mensagemId, 'AGUARDANDO_PROCESSAMENTO');
    this.logger.log(`Mensagem ${dto.mensagemId} enfileirada.`);
  }

  getStatus(id: string) {
    return this.statusService.getStatus(id);
  }
}
