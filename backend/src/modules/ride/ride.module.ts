import { Module } from '@nestjs/common';
import { RideController } from './controllers/ride.controller';
import { RideService } from './services/ride.service';
import { DriverModule } from '../driver/driver.module';

@Module({
  imports: [DriverModule],
  controllers: [RideController],
  providers: [RideService],
  exports: [RideService],
})
export class RideModule {}
