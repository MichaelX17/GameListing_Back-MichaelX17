import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Game, GameSchema } from './schemas/game.schema';
import { HowLongToBeatService } from 'howlongtobeat';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
  ],
  providers: [GameService, HowLongToBeatService],
  controllers: [GameController], 
})
export class GameModule {}
