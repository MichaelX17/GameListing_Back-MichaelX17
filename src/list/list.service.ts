import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { List, ListDocument } from './schemas/list.schema';
import mongoose, { Model, Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { SharedService } from '../shared/shared.service';
import { Game, GameDocument } from '../game/schemas/game.schema';
import { RawgService } from '../rawg/rawg.service';
import { GameService } from '../game/game.service';
import { ListGame, ProgressEnum } from './schemas/list-game.schema';
import { CreateGameDto } from '../game/dto/create-game.dto';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name) private listModel: Model<ListDocument>,
    private readonly userService: UserService,
    private readonly sharedService: SharedService,
    private readonly rawgService: RawgService,
    private readonly gameService: GameService,
  ) {}

  ///////////////////////////////
  /////////////Utils/////////////
  ///////////////////////////////

  async convertToMondoId(id: string) {
    const converted = await this.sharedService.toObjectId(id);
    if (!converted) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
    return converted;
  }

  async findAllLists() {
    const lists = await this.listModel.find();
    if (!lists) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
    return lists;
  }

  async findByUserId(id: string) {
    const userId = await this.sharedService.toObjectId(id);
    const listsByUserId = await this.listModel.find({ userId: userId });
    console.log('List: ', userId);
    if (!listsByUserId) {
      throw new HttpException('No List Found', HttpStatus.NOT_FOUND);
    }
    return listsByUserId;
  }

  async findByIdAndUserId(id: string, userId: string) {
    const mongoUserId = await this.sharedService.toObjectId(userId);
    const mongoId = await this.sharedService.toObjectId(id);
    const list = await this.listModel.findOne({
      _id: mongoId,
      userId: mongoUserId,
    });
    return list;
  }

  async findByNameAndUser(name: string, userId: string) {
    const userIdMongo = await this.sharedService.toObjectId(userId);
    const listsByName = await this.listModel.find({
      name: name,
      userId: userIdMongo,
    });
    if (!listsByName) {
      throw new HttpException('No List Found', HttpStatus.NOT_FOUND);
    }
    return listsByName;
  }

  private calculateAverage(rating: number, playtime: number): number {
    if (!playtime || playtime <= 0) return rating || 0; // Evita divisiones por 0
    return parseFloat((rating / playtime).toFixed(2)); // Redondea a 2 decimales
  }
  

  ////////////////////////////////
  ////////////Services////////////
  ////////////////////////////////

  async create(userId: string, list: List): Promise<List> {
    const userVerification = await this.userService.findUserById(
      userId.toString(),
    );
    const getLists = await this.findByNameAndUser(list.name, userId);

    if (getLists.length > 0) {
      throw new HttpException('List Name already used', HttpStatus.BAD_REQUEST);
    }

    if (userVerification) {
      // Ordenar los juegos según el campo `average` de mayor a menor
      // const sortedGames = list.games.sort((a, b) => b.average - a.average);

      const populatedGames = await this.gameService.findGameByMongoIds(
        list.games.map((game) => game.gameId.toString()), // Convertir ObjectId a string
      );
      const sortedGames = populatedGames.sort((a, b) => b.average - a.average);

      const listWithUserId = {
        ...list,
        userId: new mongoose.Types.ObjectId(userId),
        games: sortedGames, // Juegos ordenados
        gamesCount: 0,
      };

      const createdList = new this.listModel(listWithUserId);
      return createdList.save();
    }

    throw new HttpException('Validation Error', HttpStatus.BAD_REQUEST);
  }

  async deleteList(userId: string, listId: string) {
    const list = await this.listModel.findOneAndDelete({
      _id: listId,
      userId: this.sharedService.toObjectId(userId),
    });
    if (!list) {
      throw new HttpException('Error Deleting', HttpStatus.BAD_REQUEST);
    }
    return;
  }

  ///////////////////////////////////////////
  //////////////Work in Progress/////////////
  ///////////////////////////////////////////

  async update(userId: string, listId: string, updatedList: Partial<List>) {
    // Buscar la lista en la base de datos
    const list = await this.findByIdAndUserId(listId, userId);
    if (!list) {
      throw new HttpException(
        'List not found or access denied',
        HttpStatus.NOT_FOUND,
      );
    }

    const getLists = await this.findByNameAndUser(list.name, userId);

    if (getLists.length > 0 && list.userId.toString() !== userId) {
      throw new HttpException('List Name already used', HttpStatus.BAD_REQUEST);
    }

    // Si hay juegos, obtener los juegos completos, incluidos `average`, y ordenarlos
    if (updatedList.games && updatedList.games.length > 0) {
      // Obtener los gameIds como cadenas
      const gameIds = updatedList.games.map((game) => game.gameId.toString());

      // Obtener los juegos completos usando los gameIds
      const populatedGames = await this.gameService.findGameByMongoIds(gameIds);

      // Crear un mapa de gameId a juego completo
      const populatedGamesMap = new Map(
        populatedGames.map((game) => [game._id.toString(), game]), // _id debe estar presente
      );

      // Ordenar los juegos por el campo `average`
      updatedList.games = updatedList.games
        .map((game) => ({
          ...game,
          average: populatedGamesMap.get(game.gameId.toString())?.average || 0,
        }))
        .sort((a, b) => b.average - a.average);
    }

    // Actualizar la lista
    Object.assign(list, updatedList);
    return list.save();
  }

  async addGamesToList(listId: string, rawgIds: string[]) {
    const list = await this.listModel.findById(listId).populate('games.gameId');
    if (!list) {
      throw new HttpException('List not found', HttpStatus.NOT_FOUND);
    }

    // 1. Verificar juegos existentes en la base de datos
    const existingGames = await this.gameService.findGamesByRawgIds(rawgIds);
    const existingRawgIds = existingGames.map((game) => game.rawgId);

    // 2. Identificar los IDs que no están en la base de datos
    const missingRawgIds = rawgIds.filter(
      (id) => !existingRawgIds.includes(id),
    );

    // 3. Obtener juegos faltantes de la API de Rawg
    let newGames: GameDocument[] = [];
    if (missingRawgIds.length > 0) {
      const rawgGames = await this.rawgService.getGamesByIds(missingRawgIds);
      newGames = await this.gameService.insertManyGames(
        rawgGames
          .filter((game, index, self) =>
            index === self.findIndex((t) => t.id === game.id),
          )
          .map((game) => ({
            rawgId: game.id,
            name: game.name,
            average: this.calculateAverage(game.rating, game.playtime),
            background_image: game.background_image || '',
            background_image_additional: game.background_image_additional || '',
            playtime: game.playtime || 0,
            released: game.released || 'Unknown',
            rating: game.rating || 0,
          })),
      );
    }

    // 4. Consolidar todos los juegos
    const allGames = [...existingGames, ...newGames];

    // 5. Evitar duplicados en la lista y agregar nuevos juegos
    const currentGameIds = list.games.map((game) => game.gameId.toString());
    const newListGames = allGames
      .filter((game) => !currentGameIds.includes(game._id.toString()))
      .map((game) => ({
        gameId: new Types.ObjectId(game._id), // Asegúrate de que sea un ObjectId explícitamente
        progress: ProgressEnum.None,
      }));

    if (newListGames.length > 0) {
      list.games.push(...newListGames);
    }

    // 6. Ordenar los juegos por promedio (average)
    list.games = list.games.sort((a, b) => {
      const gameA = allGames.find(
        (g) => g._id.toString() === a.gameId.toString(),
      );
      const gameB = allGames.find(
        (g) => g._id.toString() === b.gameId.toString(),
      );
      return (gameB?.average || 0) - (gameA?.average || 0);
    });

    // 7. Actualizar el contador de juegos y guardar la lista
    list.gamesCount = list.games.length;
    return list.save();
}

  
}
