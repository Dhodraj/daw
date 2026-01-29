import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API info object', () => {
      expect(appController.getHello()).toEqual({
        name: 'Ride-Hailing API',
        version: '1.0.0',
        status: 'running',
        documentation: '/api-docs',
      });
    });
  });

  describe('health', () => {
    it('should return health status with timestamp and uptime', () => {
      const result = appController.getHealth() as { status: string; timestamp: string; uptime: number };
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(typeof result.uptime).toBe('number');
    });
  });
});
