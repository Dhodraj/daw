import { Module } from '@nestjs/common';
import { DriverController } from './controllers/driver.controller';
import { DriverService } from './services/driver.service';

@Module({
  controllers: [DriverController],
  providers: [DriverService],
  exports: [DriverService],
})
export class DriverModule {}
