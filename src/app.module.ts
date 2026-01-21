import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ArticlesModule } from "./articles/articles.module";
import { User } from "./users/users.entity";
import { Article } from "./articles/article.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST')!,
        port: parseInt(config.get<string>('DB_PORT')!, 10),
        username: config.get<string>('DB_USERNAME')!,
        password: config.get<string>('DB_PASSWORD')!,
        database: config.get<string>('DB_DATABASE')!,
        entities: [User, Article],
        synchronize: false,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
        logging: config.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get<string>('REDIS_HOST'),
        port: config.get<number>('REDIS_PORT'),
        ttl: 300,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ArticlesModule,
  ],
})
export class AppModule {}