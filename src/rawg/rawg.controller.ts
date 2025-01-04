import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RawgService } from './rawg.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('rawg')
export class RawgController {
  constructor(private readonly rawgService: RawgService) {}

  @Get('/game/:id')
  async getGameById(@Param('id') id: string) {
    if (!id) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return await this.rawgService.getGameById(id);
  }

  @Get('/search/:search')
  async searchGamesByName(@Param('search') search: string) {
    if (!search) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return await this.rawgService.searchGameByName(search);
  }
}
