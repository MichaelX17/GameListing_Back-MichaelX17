import { Module } from '@nestjs/common';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ],
  controllers: [AdminUserController],
  providers: [AdminUserService]
})
export class AdminUserModule {}
