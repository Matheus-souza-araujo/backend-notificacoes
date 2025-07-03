import { Injectable, Logger } from '@nestjs/common';
import { connect, Channel, Connection } from 'amqplib';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  private channel: Channel;
  private connection: Connection;

  async connect(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    try {
      this.connection = await connect(
        process.env.RABBITMQ_URL || 'amqp://localhost',
      );
      this.channel = await this.connection.createChannel();
      this.logger.log('Conexão com RabbitMQ estabelecida');
      return this.channel;
    } catch (error) {
      this.logger.error('Erro ao conectar ao RabbitMQ', error);
      throw error;
    }
  }
}
