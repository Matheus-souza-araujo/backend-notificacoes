import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  const notificationServiceMock = {
    enfileirar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: notificationServiceMock,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('notificar', () => {
    it('deve chamar o service.enfileirar e retornar 202 com mensagemId', async () => {
      const dto: CreateNotificationDto = {
        mensagemId: 'abc-123',
        conteudoMensagem: 'Mensagem de teste',
      };

      notificationServiceMock.enfileirar.mockResolvedValue(undefined);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.notificar(dto, res as any);

      expect(notificationServiceMock.enfileirar).toHaveBeenCalledWith(dto);
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({ mensagemId: dto.mensagemId });
    });
  });
});
