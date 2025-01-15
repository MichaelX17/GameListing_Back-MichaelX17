import { Module } from '@nestjs/common';
import { RawgController } from './rawg.controller';
import { RawgService } from './rawg.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [RawgController],
  providers: [RawgService],
  exports:[RawgService]
})
export class RawgModule {}
