import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGameDto } from './dto/create-game.dto';
import { Game, GameDocument, ProgressEnum } from './schemas/game.schema';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
  ) { }

  async create(game: Game): Promise<Game> {
    // Verificar si ya existe un juego con el mismo rawgId
    const existingGame = await this.gameModel.findOne({ rawgId: game.rawgId });
    if (existingGame) {
        throw new HttpException(
            `A game already exists.`,
            HttpStatus.CONFLICT,
        );
    }

    // Calcular el average y asignar progress por defecto
    const average = game.rating / game.playtime;
    const progress = ProgressEnum.None;

    // Crear y guardar el nuevo juego
    const createdGame = new this.gameModel({ ...game, average, progress });
    return createdGame.save();
}


  async findAll(): Promise<Game[]> {
    return this.gameModel.find().sort({ average: -1 }).exec();
  }

  async findGameByRawgId(id: string): Promise<Game> {
    const game = await this.gameModel.findOne({ rawgId: id })
    if(!game){
      throw new HttpException('No game found', HttpStatus.NOT_FOUND)
    }
    return game;
  }

  async findGameByMongoIds(ids: string[]): Promise<Game[]> {
    const games = await this.gameModel.find({ _id: { $in: ids } }); // Buscar juegos por array de IDs
    return games;
  }

  async findOneByRawgId(id: string){
    const game = await this.gameModel.find({ rawgId: id })
    if(!game){
      throw new HttpException('No game found', HttpStatus.NOT_FOUND)
    }
    return game;
  }

  async findGamesByRawgIds(rawgIds: string[]) {
    return this.gameModel.find({ rawgId: { $in: rawgIds } });
  }

  async insertManyGames(games: Partial<Game>[]): Promise<GameDocument[]> {
    const rawgIds = games.map((game) => game.rawgId);
    
    // Encuentra juegos que ya existen en la base de datos
    const existingGames = await this.findGamesByRawgIds(rawgIds);
    const existingRawgIds = existingGames.map((game) => game.rawgId);
  
    // Filtra los juegos que no existen
    const newGames = games.filter((game) => !existingRawgIds.includes(game.rawgId));
  
    // Inserta solo los juegos nuevos
    if (newGames.length > 0) {
      await this.gameModel.insertMany(newGames);
    }
  
    // Retorna todos los juegos (nuevos y existentes)
    return this.findGamesByRawgIds(rawgIds);
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
  
}
