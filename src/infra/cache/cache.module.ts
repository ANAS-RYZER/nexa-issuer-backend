import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (config: ConfigService) => ({
        store: redisStore as any,
        socket: {
          host: config.get('REDIS_HOST'),
          port: Number(config.get('REDIS_PORT')),
          tls: config.get('REDIS_TLS') === 'true' ? {} : undefined,
        },
        username: config.get('REDIS_USERNAME'),
        password: config.get('REDIS_PASSWORD'),
        ttl: 50 * 60, // 50 mins
      }),
    }),
  ],
})
export class GlobalCacheModule {}
