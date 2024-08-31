import { Controller, Get, Post, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './schemas/game.schema';

@Controller('/games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  async create(@Body() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto as Game);
  }

  @Get()
  async findAll() {
    return this.gameService.findAll();
  }
}
