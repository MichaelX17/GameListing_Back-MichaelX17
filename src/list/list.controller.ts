import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ListService } from './list.service';
import { List } from './schemas/list.schema';
import { CreateListDto } from './dto/create-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateListDto } from './dto/update-list.dto';
import { AddGamesDto } from './dto/add-game.dto';

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async getAllLists() {
    return this.listService.findAllLists();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/mylists')
  async getMyLists(@Request() req) {
    return this.listService.findByUserId(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async create(@Request() req, @Body() createListDto: CreateListDto) {
    return this.listService.create(req.user.userId, createListDto as List);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update/:id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateListDto: UpdateListDto,
  ) {
    return this.listService.update(req.user.userId, id, updateListDto);
  }

  @Post(':listId/add-games')
  async addGamesToList(
    @Param('listId') listId: string,
    @Body() addGamesDto: AddGamesDto,
  ) {
    const { rawgIds } = addGamesDto;

    if (!listId) {
      throw new HttpException('List ID is required', HttpStatus.BAD_REQUEST);
    }

    return this.listService.addGamesToList(listId, rawgIds);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  async delete(@Request() req, @Param('id') id: string) {
    return this.listService.deleteList(req.user.userId, id);
  }
}
