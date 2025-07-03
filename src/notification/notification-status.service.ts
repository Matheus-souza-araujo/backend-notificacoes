import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationStatusService {
  private statusMap = new Map<string, string>();

  setStatus(mensagemId: string, status: string) {
    this.statusMap.set(mensagemId, status);
  }

  getStatus(mensagemId: string) {
    return {
      mensagemId,
      status: this.statusMap.get(mensagemId) || 'DESCONHECIDO',
    };
  }
}
