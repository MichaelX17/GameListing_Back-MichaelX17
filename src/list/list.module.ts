import { Module } from '@nestjs/common';
import { ListController } from './list.controller';
import { ListService } from './list.service';
import { MongooseModule } from '@nestjs/mongoose';
import { List, ListSchema } from './schemas/list.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: List.name, schema: ListSchema }]),
    UserModule
  ],
  controllers: [ListController],
  providers: [ListService]
})
export class ListModule {}
