import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ListModule } from './list/list.module';
import { RawgModule } from './rawg/rawg.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // carga variables globales del .env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'), // lee la URI de MongoDB
      }),
      inject: [ConfigService],
    }),
    GameModule,
    UserModule,
    AuthModule,
    ListModule,
    RawgModule,
    HttpModule
    // Aquí agregarás otros módulos según lo necesites
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
