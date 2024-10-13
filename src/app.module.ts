import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/gameratingapp'),
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que las variables de entorno estén disponibles en toda la aplicación
    }),
    GameModule,
    UserModule,
    AuthModule,
    // Aquí agregarás otros módulos según lo necesites
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
