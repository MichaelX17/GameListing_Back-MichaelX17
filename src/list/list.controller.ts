import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ListService } from './list.service';
import { List } from './schemas/list.schema';
import { CreateListDto } from './dto/create-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async create(@Request() req, @Body() createListDto: CreateListDto) {
    return this.listService.create(req.user.userId, createListDto as List);
  }
}
