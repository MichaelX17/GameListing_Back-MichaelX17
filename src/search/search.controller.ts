import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // Endpoint para buscar por username
  @Get('/username/:data')
  async searchByUsername(@Param('data') data: string) {
    return this.searchService.searchByUsername(data);
  }

  // Endpoint para buscar por email
  @Get('/email/:data')
  async searchByEmail(@Param('data') data: string) {
    return this.searchService.searchByEmail(data);
  }
}
