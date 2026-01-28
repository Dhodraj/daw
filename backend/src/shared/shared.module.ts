import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { RedisService } from './redis/redis.service';
import { MetricsService } from './monitoring/metrics.service';
import configuration from './config/configuration';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.local'],
    }),
  ],
  providers: [PrismaService, RedisService, ConfigService, MetricsService],
  exports: [PrismaService, RedisService, ConfigService, MetricsService],
})
export class SharedModule {}
