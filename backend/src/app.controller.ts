import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): object {
    return {
      name: 'Ride-Hailing API',
      version: '1.0.0',
      status: 'running',
      documentation: '/api-docs',
    };
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
