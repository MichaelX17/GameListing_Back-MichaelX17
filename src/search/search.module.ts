import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[UserModule],
  providers: [SearchService],
  controllers: [SearchController]
})
export class SearchModule {}
