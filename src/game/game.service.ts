import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGameDto } from './dto/create-game.dto';
import { Game, GameDocument } from './schemas/game.schema';
import { HowLongToBeatService, HowLongToBeatEntry } from 'howlongtobeat';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    private readonly howLongToBeatService: HowLongToBeatService,
  ) { }

  async create(game: Game): Promise<Game> {
    const average = game.rating / game.hours;
    const createdGame = new this.gameModel({ ...game, average });
    return createdGame.save();
  }

  async findAll(): Promise<Game[]> {
    return this.gameModel.find().sort({ average: -1 }).exec();
  }

  // async findGameByName(gameName: string) {

  //   console.log("Name 2: ", gameName);

  //   const game = await this.howLongToBeatService.search('minecraft');

  //   console.log("Game: ", game);


  //   if (!game) {
  //     throw new HttpException(
  //       'The Game Was Not Found',
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }

  //   return game;
  // }

  async findGameByName(gameName: string) {
    console.log("Name 2: ", gameName);
    
    try {
      const game = await this.howLongToBeatService.search(gameName);
      console.log("Response from API: ", game);
  
      if (!game || game.length === 0) {
        throw new HttpException('The Game Was Not Found', HttpStatus.NOT_FOUND);
      }
  
      return game;
    } catch (error) {
      console.error("Error fetching game: ", error);
      throw new HttpException('Failed to fetch game data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
}
