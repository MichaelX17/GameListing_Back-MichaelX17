import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Game, GameSchema } from './schemas/game.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]), // Registro del modelo
  ],
  providers: [GameService],  // Registro del servicio
  controllers: [GameController],  // Registro del controlador
})
export class GameModule {}
