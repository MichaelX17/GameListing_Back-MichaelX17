import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class SearchService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  // Servicio para buscar por username
  async searchByUsername(query: string): Promise<User[]> {
    if (!query) {
      throw new BadRequestException('Search query cannot be empty');
    }

    return this.userModel.aggregate([
      {
        $search: {
          index: 'usernameIndex', // Nombre del índice en MongoDB Atlas
          autocomplete: {
            query,
            path: 'username', // Campo que estamos buscando
            fuzzy: {
              maxEdits: 2, // Permite errores tipográficos
            },
          },
        },
      },
      {
        $project: {
          username: 1,
          email: 1,
          score: { $meta: 'searchScore' }, // Incluye el score de relevancia
        },
      },
    ]);
  }

  // Servicio para buscar por email
  async searchByEmail(query: string): Promise<User[]> {
    if (!query) {
      throw new BadRequestException('Search query cannot be empty');
    }

    return this.userModel.aggregate([
      {
        $search: {
          index: 'email', // Nombre del índice en MongoDB Atlas
          text: {
            query,
            path: 'email', // Campo que estamos buscando
          },
        },
      },
      {
        $project: {
          username: 1,
          email: 1,
          score: { $meta: 'searchScore' }, // Incluye el score de relevancia
        },
      },
    ]);
  }
}
