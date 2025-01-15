import { Module } from '@nestjs/common';
import { ListController } from './list.controller';
import { ListService } from './list.service';
import { MongooseModule } from '@nestjs/mongoose';
import { List, ListSchema } from './schemas/list.schema';
import { UserModule } from '../user/user.module';
import { SharedModule } from '../shared/shared.module';
import { RawgModule } from '../rawg/rawg.module';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: List.name, schema: ListSchema }]),
    UserModule,
    SharedModule,
    RawgModule,
    GameModule
  ],
  controllers: [ListController],
  providers: [ListService]
})
export class ListModule {}
