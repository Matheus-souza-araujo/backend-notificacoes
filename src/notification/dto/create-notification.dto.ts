import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  mensagemId: string;

  @IsNotEmpty()
  conteudoMensagem: string;
}
