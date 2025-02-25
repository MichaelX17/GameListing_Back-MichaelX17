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
import { ObjectId } from 'mongodb';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name) private listModel: Model<ListDocument>,
    private readonly userService: UserService,
    private readonly sharedService: SharedService,
    private readonly rawgService: RawgService,
    private readonly gameService: GameService,
  ) { }

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

  async findById(id: string) {
    const list = await this.listModel.find({ id: id });
    if (!list) {
      throw new HttpException('No List Found', HttpStatus.NOT_FOUND);
    }
    return list;
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

  // async addGamesToList2(listId: string, rawgIds: string[]): Promise<List> {
  //   const list = await this.listModel.findById(listId);
  //   if (!list) {
  //     throw new HttpException('List not found', HttpStatus.NOT_FOUND);
  //   }

  //   // Obtener juegos existentes en BD local
  //   const existingGames = await this.gameService.findGamesByRawgIds(rawgIds)
  //   const existingGameMap = new Map(existingGames.map(game => [game.rawgId, game._id]));

  //   // Filtrar IDs que no están en la base de datos
  //   const missingRawgIds = rawgIds.filter(id => !existingGameMap.has(id));

  //   // Obtener datos de juegos desde la API y guardarlos
  //   for (const rawgId of missingRawgIds) {
  //     const gameData = await this.gameService.findGameByRawgId(rawgId);
  //     if (gameData) {
  //       const newGame = await this.gameService.create({
  //         rawgId: gameData.id,
  //         name: gameData.name,
  //         rating: gameData.rating,
  //         released: gameData.released,
  //         playtime: gameData.playtime,
  //         background_image: gameData.background_image,
  //         background_image_additional: gameData.background_image_additional,
  //         genres: Array.isArray(gameData.genres)
  //           ? gameData.genres.map((g: any) => g.name)
  //           : [],

  //         developers: Array.isArray(gameData.developers)
  //           ? gameData.developers.map((d: any) => d.name)
  //           : [],


  //       });
  //       existingGameMap.set(rawgId, newGame._id);
  //     }
  //   }

  //   // Construir lista de juegos con progreso preservado
  //   const updatedGamesMap = new Map(list.games.map(g => [g.gameId.toString(), g.progress]));
  //   const updatedGames: ListGame[] = rawgIds.map(rawgId => ({
  //     gameId: existingGameMap.get(rawgId),
  //     progress: updatedGamesMap.get(existingGameMap.get(rawgId)?.toString()) || 'None',
  //   }));

  //   // Obtener juegos para ordenarlos
  //   const sortedGames = await this.findLocalGamesByMongoId(updatedGames.map(g => g.gameId));
  //   sortedGames.sort((a, b) => (b.rating / b.playtime) - (a.rating / a.playtime));

  //   // Guardar lista con juegos ordenados
  //   list.games = sortedGames.map(game => ({
  //     gameId: game._id,
  //     progress: updatedGamesMap.get(game._id.toString()) || 'None',
  //   }));
  //   list.gamesCount = list.games.length;
  //   return list.save();
  // }

  // async addGamesToList(listId: string, rawgIds: string[]): Promise<List> {
  //   const list = await this.listModel.findById(listId);
  //   if (!list) {
  //     throw new HttpException('List not found', HttpStatus.NOT_FOUND);
  //   }

  //   // Obtener juegos existentes en BD local
  //   const existingGames = await this.gameService.findGamesByRawgIds(rawgIds);

  //   // Asegúrate de que game._id sea de tipo ObjectId
  //   const existingGameMap = new Map<string, ObjectId>(
  //     existingGames.map(game => [game.rawgId, game._id as ObjectId]) // Cast explícito a ObjectId
  //   );

  //   // Filtrar IDs que no están en la base de datos
  //   const missingRawgIds = rawgIds.filter(id => !existingGameMap.has(id));

  //   // Obtener datos de juegos desde la API y guardarlos
  //   for (const rawgId of missingRawgIds) {
  //     const gameData = await this.gameService.findGameByRawgId(rawgId);
  //     if (gameData) {
  //       const newGame = await this.gameService.create({
  //         rawgId: gameData.id,
  //         name: gameData.name,
  //         rating: gameData.rating,
  //         released: gameData.released,
  //         playtime: gameData.playtime,
  //         background_image: gameData.background_image,
  //         background_image_additional: gameData.background_image_additional,
  //         genres: Array.isArray(gameData.genres)
  //           ? gameData.genres.map((g: any) => g.name)
  //           : [],
  //         developers: Array.isArray(gameData.developers)
  //           ? gameData.developers.map((d: any) => d.name)
  //           : [],
  //       });
  //       existingGameMap.set(rawgId, newGame._id as ObjectId); // Cast explícito a ObjectId
  //     }
  //   }

  //   // Construir lista de juegos con progreso preservado
  //   const updatedGamesMap = new Map<string, ProgressEnum | 'None'>(
  //     list.games.map(g => [g.gameId.toString(), g.progress])
  //   );

  //   const updatedGames: ListGame[] = rawgIds.map(rawgId => ({
  //     gameId: existingGameMap.get(rawgId) as Types.ObjectId, // Usa Types.ObjectId en lugar de ObjectId
  //     progress: updatedGamesMap.get(existingGameMap.get(rawgId)?.toString()) as ProgressEnum || ProgressEnum.None, // Asegúrate de que sea de tipo ProgressEnum
  //   }));

  //   // Obtener juegos para ordenarlos
  //   const sortedGames = await this.gameService.findLocalGamesByMongoId(
  //     updatedGames.map(g => g.gameId.toString()) // Convierte ObjectId a string
  //   );
  //   sortedGames.sort((a, b) => (b.rating / b.playtime) - (a.rating / a.playtime));

  //   // Guardar lista con juegos ordenados
  //   list.games = sortedGames.map(game => ({
  //     gameId: game._id as Types.ObjectId, // Cast explícito a Types.ObjectId
  //     progress: updatedGamesMap.get(game._id.toString()) as ProgressEnum || ProgressEnum.None, // Asegúrate de que sea de tipo ProgressEnum
  //   }));

  //   list.gamesCount = list.games.length;
  //   return list.save();
  // }

  async addGamesToList(listId: string, rawgIds: string[]): Promise<List> {
    const list = await this.listModel.findById(listId);
    if (!list) {
      throw new HttpException('List not found', HttpStatus.NOT_FOUND);
    }
  
    // Obtener juegos existentes en BD local
    const existingGames = await this.gameService.findGamesByRawgIds(rawgIds);
  
    // Mapear los juegos existentes por su rawgId
    const existingGameMap = new Map<string, ObjectId>(
      existingGames.map(game => [game.rawgId, game._id as ObjectId]) // Cast explícito a ObjectId
    );
  
    // Filtrar IDs que no están en la base de datos
    const missingRawgIds = rawgIds.filter(id => !existingGameMap.has(id));
  
    // Obtener datos de juegos desde la API y guardarlos
    for (const rawgId of missingRawgIds) {
      const gameData = await this.rawgService.getGameById(rawgId);
      if (gameData) {
        const newGame = await this.gameService.create({
          rawgId: gameData.id,
          name: gameData.name,
          rating: gameData.rating,
          released: gameData.released,
          playtime: gameData.playtime,
          background_image: gameData.background_image,
          background_image_additional: gameData.background_image_additional,
          genres: Array.isArray(gameData.genres)
            ? gameData.genres.map((g: any) => g.name)
            : [],
          developers: Array.isArray(gameData.developers)
            ? gameData.developers.map((d: any) => d.name)
            : [],
        });
        existingGameMap.set(rawgId, newGame._id as ObjectId); // Cast explícito a ObjectId
      }
    }
  
    // Crear un mapa de los juegos actuales en la lista para preservar su progreso
    const currentGamesMap = new Map<string, ListGame>(
      list.games.map(g => [g.gameId.toString(), g])
    );
  
    // Crear un mapa de los nuevos juegos a agregar
    const newGamesMap = new Map<string, ListGame>(
      rawgIds.map(rawgId => {
        const gameId = existingGameMap.get(rawgId);
        if (!gameId) {
          throw new HttpException(`Game with rawgId ${rawgId} not found`, HttpStatus.NOT_FOUND);
        }
        return [
          gameId.toString(),
          {
            gameId: gameId as Types.ObjectId,
            progress: currentGamesMap.get(gameId.toString())?.progress || ProgressEnum.None,
          },
        ];
      })
    );
  
    // Fusionar los juegos actuales con los nuevos juegos
    const mergedGamesMap = new Map([...currentGamesMap, ...newGamesMap]);
  
    // Convertir el mapa fusionado a una lista de juegos
    const mergedGames = Array.from(mergedGamesMap.values());
  
    // Obtener los juegos para ordenarlos
    const sortedGames = await this.gameService.findLocalGamesByMongoId(
      mergedGames.map(g => g.gameId.toString()) // Convierte ObjectId a string
    );
    sortedGames.sort((a, b) => (b.rating / b.playtime) - (a.rating / a.playtime));
  
    // Actualizar la lista con los juegos fusionados y ordenados
    list.games = sortedGames.map(game => ({
      gameId: game._id as Types.ObjectId, // Cast explícito a Types.ObjectId
      progress: mergedGamesMap.get(game._id.toString())?.progress || ProgressEnum.None,
    }));
  
    list.gamesCount = list.games.length;
    return list.save();
  }

  async removeGamesFromList(listId: string, rawgIds: string[]): Promise<List> {
    const list = await this.listModel.findById(listId).populate('games.gameId');
    if (!list) {
      throw new HttpException('List not found', HttpStatus.NOT_FOUND);
    }

    const gamesToRemove = new Set(rawgIds);

    // Filtrar los juegos que deben permanecer en la lista
    list.games = list.games.filter((listGame) => {
      const game = listGame.gameId as unknown as Game;
      return game && !gamesToRemove.has(game.rawgId);
    });

    list.gamesCount = list.games.length;

    await list.save();
    console.log(`List updated successfully, remaining games: ${list.games.length}`);

    return list;
  }

  async getListWithGames(listId: string): Promise<List> {
    const list = await this.listModel.findById(listId).populate('games.gameId');

    if (!list) {
      throw new HttpException('List not found', HttpStatus.NOT_FOUND);
    }

    return list;
  }
}
