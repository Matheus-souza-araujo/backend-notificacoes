import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationStatusService } from './notification-status.service';
import { RabbitMQService } from '../shared/rabbitmq.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

describe('NotificationService', () => {
  let service: NotificationService;
  let rabbitMQService: RabbitMQService;
  let statusService: NotificationStatusService;

  const mockChannel = {
    sendToQueue: jest.fn(),
  };

  const rabbitMQServiceMock = {
    connect: jest.fn().mockResolvedValue(mockChannel),
  };

  const statusServiceMock = {
    setStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: RabbitMQService, useValue: rabbitMQServiceMock },
        { provide: NotificationStatusService, useValue: statusServiceMock },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
    statusService = module.get<NotificationStatusService>(
      NotificationStatusService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve enfileirar a mensagem e salvar status', async () => {
    const dto: CreateNotificationDto = {
      mensagemId: '123',
      conteudoMensagem: 'Teste de mensagem',
    };

    await service.enfileirar(dto);

    expect(rabbitMQService.connect).toHaveBeenCalled();
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      expect.stringContaining('fila.notificacao.entrada'),
      expect.any(Buffer),
    );
    expect(statusService.setStatus).toHaveBeenCalledWith(
      dto.mensagemId,
      'AGUARDANDO_PROCESSAMENTO',
    );
  });
});
