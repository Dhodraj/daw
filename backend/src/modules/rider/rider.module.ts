import { Module } from '@nestjs/common';
import { RiderController } from './controllers/rider.controller';
import { RiderService } from './services/rider.service';

@Module({
  controllers: [RiderController],
  providers: [RiderService],
  exports: [RiderService],
})
export class RiderModule {}
