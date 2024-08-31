import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/gameratingapp'),
    GameModule,
    UserModule,
    // Aquí agregarás otros módulos según lo necesites
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
