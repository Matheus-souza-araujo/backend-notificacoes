import { Injectable } from '@nestjs/common';
import { connect, Channel } from 'amqplib';
import { CreateNotificationDto } from './dto/create-notification.dto';
@Injectable()
export class NotificationService {
  private channel: Channel;
  private readonly filaEntrada = 'fila.notificacao.entrada.matheus';
  private readonly filaStatus = 'fila.notificacao.status.matheus';
  private statusMap = new Map<string, string>();

  async onModuleInit() {
    const conn = await connect('amqp://localhost');
    this.channel = await conn.createChannel();

    await this.channel.assertQueue(this.filaEntrada);
    await this.channel.assertQueue(this.filaStatus);

    this.channel.consume(this.filaEntrada, async (msg) => {
      if (!msg) return;
      const data = JSON.parse(msg.content.toString());

      // Simula processamento com atraso aleatório
      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
      const falha = Math.floor(Math.random() * 10) < 2;

      const status = falha ? 'FALHA_PROCESSAMENTO' : 'PROCESSADO_SUCESSO';
      this.statusMap.set(data.mensagemId, status);

      this.channel.sendToQueue(
        this.filaStatus,
        Buffer.from(JSON.stringify({ mensagemId: data.mensagemId, status })),
      );

      this.channel.ack(msg);
    });
  }

  enfileirar(dto: CreateNotificationDto) {
    const buffer = Buffer.from(JSON.stringify(dto));
    this.channel.sendToQueue(this.filaEntrada, buffer);
    this.statusMap.set(dto.mensagemId, 'AGUARDANDO_PROCESSAMENTO');
  }

  getStatus(id: string) {
    return { mensagemId: id, status: this.statusMap.get(id) || 'DESCONHECIDO' };
  }
}
