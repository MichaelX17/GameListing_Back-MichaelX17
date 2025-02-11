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

  // async addGamesToList(listId: string, rawgIds: string[]): Promise<List> {
  //   const list = await this.listModel.findById(listId).populate('games.gameId');
  //   if (!list) {
  //     throw new HttpException('List not found', HttpStatus.NOT_FOUND);
  //   }

  //   const gameReferences: ListGame[] = [];
  //   const processedRawgIds = new Set(); // Para evitar procesar duplicados en rawgIds

  //   for (const rawgId of rawgIds) {
  //     if (processedRawgIds.has(rawgId)) continue; // Ignorar IDs duplicados en la solicitud
  //     processedRawgIds.add(rawgId);

  //     // Buscar el juego en la tabla Games
  //     let game = await this.gameService.findGameByRawgId(rawgId);

  //     if (!game) {
  //       // Si no existe, consultar la API de RAWG y guardarlo en Games
  //       const rawgGameData = await this.rawgService.getGameById(rawgId);

  //       const rawgGame: Partial<Game> = {
  //         rawgId: rawgGameData.id,
  //         name: rawgGameData.name,
  //         rating: rawgGameData.rating,
  //         released: rawgGameData.released,
  //         playtime: rawgGameData.playtime,
  //         background_image: rawgGameData.background_image,
  //         background_image_additional: rawgGameData.background_image_additional,
  //         genres: rawgGameData.genres.map((g: any) => g.name),
  //         developers: rawgGameData.developers.map((d: any) => d.name),
  //       };

  //       game = await this.gameService.create(rawgGame);
  //     }

  //     // Verificar si ya está en la lista usando game._id directamente
  //     const isAlreadyInList = list.games.some(
  //       (listGame) => listGame.gameId.equals(game.id) // Comparar ObjectId correctamente
  //     );

  //     if (!isAlreadyInList) {
  //       // Agregar el juego a la lista de referencias si no está ya presente
  //       gameReferences.push({ gameId: game.id, progress: ProgressEnum.None });
  //     }
  //   }

  //   // Agregar los juegos nuevos a la lista
  //   list.games.push(...gameReferences);
  //   list.gamesCount = list.games.length;

  //   // Guardar la lista actualizada
  //   return list.save();
  // }

  // async addGamesToList2(listId: string, rawgIds: string[]): Promise<List> {
  //   const list = await this.listModel.findById(listId).populate('games.gameId');
  //   if (!list) {
  //     throw new HttpException('List not found', HttpStatus.NOT_FOUND);
  //   }

  //   const gameReferences: ListGame[] = [];
  //   const processedRawgIds = new Set(); // Para evitar procesar duplicados en rawgIds

  //   for (const rawgId of rawgIds) {
  //     if (processedRawgIds.has(rawgId)) continue; // Ignorar IDs duplicados en la solicitud
  //     processedRawgIds.add(rawgId);

  //     // Buscar el juego en la tabla Games
  //     let game = await this.gameService.findGameByRawgId(rawgId);

  //     if (!game) {
  //       // Si no existe, consultar la API de RAWG y guardarlo en Games
  //       const rawgGameData = await this.rawgService.getGameById(rawgId);

  //       if (!rawgGameData) {
  //         // Si no se encuentra el juego en RAWG, continuar con el siguiente ID
  //         console.warn(`Game with RAWG ID ${rawgId} not found.`);
  //         continue;
  //       }

  //       const rawgGame: Partial<Game> = {
  //         rawgId: rawgGameData.id,
  //         name: rawgGameData.name,
  //         rating: rawgGameData.rating,
  //         released: rawgGameData.released,
  //         playtime: rawgGameData.playtime,
  //         background_image: rawgGameData.background_image,
  //         background_image_additional: rawgGameData.background_image_additional,
  //         genres: rawgGameData.genres.map((g: any) => g.name),
  //         developers: rawgGameData.developers.map((d: any) => d.name),
  //       };

  //       game = await this.gameService.create(rawgGame);
  //     }

  //     // Verificar si ya está en la lista usando game._id directamente
  //     const isAlreadyInList = list.games.some(
  //       (listGame) => listGame.gameId.equals(game.id), // Comparar ObjectId correctamente
  //     );

  //     if (!isAlreadyInList) {
  //       // Agregar el juego a la lista de referencias si no está ya presente
  //       gameReferences.push({ gameId: game.id, progress: ProgressEnum.None });
  //     }
  //   }

  //   // Agregar los juegos nuevos a la lista
  //   list.games.push(...gameReferences);
  //   list.gamesCount = list.games.length;

  //   // Guardar la lista actualizada
  //   return list.save();
  // }

  // async addGamesToList2(listId: string, rawgIds: string[]): Promise<List> {
  //   const list = await this.listModel.findById(listId).populate('games.gameId');
  //   if (!list) {
  //     throw new HttpException('List not found', HttpStatus.NOT_FOUND);
  //   }

  //   const gameReferences: ListGame[] = [];
  //   const processedRawgIds = new Set(); // Para evitar procesar duplicados en rawgIds

  //   for (const rawgId of rawgIds) {
  //     if (processedRawgIds.has(rawgId)) continue; // Ignorar IDs duplicados en la solicitud
  //     processedRawgIds.add(rawgId);

  //     // Buscar el juego en la tabla Games
  //     let game = await this.gameService.findGameByRawgId(rawgId);

  //     if (!game) {
  //       // Si no existe, consultar la API de RAWG y guardarlo en Games
  //       const rawgGameData = await this.rawgService.getGameById(rawgId);

  //       if (!rawgGameData) {
  //         // Si no se encuentra el juego en RAWG, continuar con el siguiente ID
  //         console.warn(`Game with RAWG ID ${rawgId} not found.`);
  //         continue;
  //       }

  //       const rawgGame: Partial<Game> = {
  //         rawgId: rawgGameData.id,
  //         name: rawgGameData.name,
  //         rating: rawgGameData.rating,
  //         released: rawgGameData.released,
  //         playtime: rawgGameData.playtime,
  //         background_image: rawgGameData.background_image,
  //         background_image_additional: rawgGameData.background_image_additional,
  //         genres: rawgGameData.genres.map((g: any) => g.name),
  //         developers: rawgGameData.developers.map((d: any) => d.name),
  //       };

  //       game = await this.gameService.create(rawgGame);
  //     }

  //     // Verificar si ya está en la lista usando game._id directamente
  //     const isAlreadyInList = list.games.some(
  //       (listGame) => listGame.gameId.equals(game.id), // Comparar ObjectId correctamente
  //     );

  //     if (!isAlreadyInList) {
  //       // Agregar el juego a la lista de referencias si no está ya presente
  //       gameReferences.push({ gameId: game.id, progress: ProgressEnum.None });
  //     }
  //   }

  //   // Agregar los juegos nuevos a la lista
  //   list.games.sort((a, b) => {
  //     // Verificar y convertir gameId a Game
  //     const gameA =
  //       a.gameId instanceof Object ? (a.gameId as unknown as Game) : null;
  //     const gameB =
  //       b.gameId instanceof Object ? (b.gameId as unknown as Game) : null;

  //     if (!gameA || !gameB) {
  //       // Si no es posible convertir alguno, tratar como iguales
  //       return 0;
  //     }

  //     const averageA = gameA.rating / (gameA.playtime || 1); // Evitar división por 0
  //     const averageB = gameB.rating / (gameB.playtime || 1);

  //     return averageB - averageA; // Orden descendente
  //   });

  //   // Actualizar el conteo de juegos
  //   list.gamesCount = list.games.length;

  //   // Guardar la lista actualizada
  //   return list.save();
  // }

  async addGamesToList(listId: string, rawgIds: string[]): Promise<List> {
    const list = await this.listModel.findById(listId).populate('games.gameId');
    if (!list) {
      throw new HttpException('List not found', HttpStatus.NOT_FOUND);
    }
  
    const gameReferences: ListGame[] = [];
    const processedRawgIds = new Set();
  
    for (const rawgId of rawgIds) {
      if (processedRawgIds.has(rawgId)) continue;
      processedRawgIds.add(rawgId);
  
      let game = await this.gameService.findGameByRawgId(rawgId);
  
      if (!game) {
        const rawgGameData = await this.rawgService.getGameById(rawgId);
  
        if (!rawgGameData) {
          console.warn(`Game with RAWG ID ${rawgId} not found.`);
          continue;
        }
  
        const rawgGame: Partial<Game> = {
          rawgId: rawgGameData.id,
          name: rawgGameData.name,
          rating: rawgGameData.rating,
          released: rawgGameData.released,
          playtime: rawgGameData.playtime,
          background_image: rawgGameData.background_image,
          background_image_additional: rawgGameData.background_image_additional,
          genres: rawgGameData.genres.map((g: any) => g.name),
          developers: rawgGameData.developers.map((d: any) => d.name),
        };
  
        game = await this.gameService.create(rawgGame);
      }
  
      const isAlreadyInList = list.games.some(
        (listGame) => listGame.gameId.equals(game.id),
      );
  
      if (!isAlreadyInList) {
        const gameId = this.sharedService.toObjectId(game.id);
        gameReferences.push({ gameId: gameId, progress: ProgressEnum.None });
        console.log(`Added game to references: ${game.name}`);
      }
    }
  
    console.log(`Game references to add:`, gameReferences);
  
    
  
    // Ordenar los juegos en la lista por Average
    list.games.sort((a, b) => {
      const gameA = a.gameId instanceof Object ? (a.gameId as unknown as Game) : null;
      const gameB = b.gameId instanceof Object ? (b.gameId as unknown as Game) : null;
  
      if (!gameA || !gameB) {
        return 0;
      }
  
      const averageA = gameA.rating / (gameA.playtime || 1);
      const averageB = gameB.rating / (gameB.playtime || 1);
  
      return averageB - averageA;
    });

    // Agregar los juegos nuevos a la lista
    list.games.push(...gameReferences);
    console.log(`Games in the list after push:`, list.games);
    console.log("Games: ", list.games);
  
    list.gamesCount = list.games.length;
  
    await list.save();
    console.log(`List saved successfully with ${list.games.length} games.`);
  
    return list;
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
  
  
}
