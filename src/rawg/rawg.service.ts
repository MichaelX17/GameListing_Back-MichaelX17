import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RawgService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getGameById(id: string): Promise<any | null> {
    const apiUrl = this.configService.get<string>('RAWG_API_URL');
    const apiKey = this.configService.get<string>('RAWG_API_KEY');
  
    if (!id) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/${id}`, {
          params: { key: apiKey },
        }),
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Si el error es un 404, devolver null en lugar de lanzar una excepción
        return null;
      }
      // Re-lanzar otros errores no manejados
      throw new HttpException(
        error.message || 'Error fetching game data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  

  async getGamesByIds(ids: string[]): Promise<any[]> {
    const games = await Promise.all(ids.map((id) => this.getGameById(id)));
    return games.filter((game) => game); // Filtra los valores nulos o indefinidos
  }

  async searchGameByName(search: string): Promise<any> {
    const apiUrl = this.configService.get<string>('RAWG_API_URL');
    const apiKey = this.configService.get<string>('RAWG_API_KEY');

    if (!search) {
      throw new HttpException(
        'Search term is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(apiUrl, {
          params: {
            key: apiKey,
            search,
          },
        }),
      );

      if (response.data.count === 0) {
        throw new HttpException(
          'No games found for the given search term',
          HttpStatus.NOT_FOUND,
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        'Error in RAWG API request:',
        error.response?.data || error.message,
      );

      if (error.response?.status === 404) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        'Error fetching data from RAWG API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
