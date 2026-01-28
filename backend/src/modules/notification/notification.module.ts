import { Module } from '@nestjs/common';
import { RideGateway } from './gateways/ride.gateway';

@Module({
  providers: [RideGateway],
  exports: [RideGateway],
})
export class NotificationModule {}
