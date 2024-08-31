import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGameDto } from './dto/create-game.dto';
import { Game, GameDocument } from './schemas/game.schema';

@Injectable()
export class GameService {
  constructor(@InjectModel(Game.name) private gameModel: Model<GameDocument>) {}

  async create(game: Game): Promise<Game> {
    const average = game.rating / game.hours;
    const createdGame = new this.gameModel({ ...game, average });
    return createdGame.save();
  }

  async findAll(): Promise<Game[]> {
    return this.gameModel.find().sort({ average: -1 }).exec();
  }
}
