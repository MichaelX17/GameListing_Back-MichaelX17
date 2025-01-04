import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { List, ListDocument } from './schemas/list.schema';
import mongoose, { Model } from 'mongoose';
import { UserService } from '../user/user.service';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name) private listModel: Model<ListDocument>,
    private readonly userService: UserService,
  ) {}

  async create(userId: string, list: List): Promise<List> {
    const userVerification = await this.userService.findUserById(userId.toString());
    if (userVerification) {
      // Ordenar los juegos según el campo `average` de mayor a menor
      const sortedGames = list.games.sort((a, b) => b.average - a.average);
  
      const listWithUserId = {
        ...list,
        userId: new mongoose.Types.ObjectId(userId),
        games: sortedGames, // Juegos ordenados
      };
  
      const createdList = new this.listModel(listWithUserId);
      return createdList.save();
    }
  
    throw new HttpException('Validation Error', HttpStatus.BAD_REQUEST);
  }
  
}
