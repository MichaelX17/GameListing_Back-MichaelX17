import { Module } from '@nestjs/common';
import { SharedController } from './shared.controller';
import { SharedService } from './shared.service';

@Module({
  controllers: [SharedController],
  providers: [SharedService],
  exports: [SharedService]
})
export class SharedModule {}
