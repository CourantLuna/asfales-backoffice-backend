// auth/user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from 'src/controllers/user.controller';
import { UsersController } from 'src/controllers/users.controller';
import { UserService } from 'src/services/user.service';


@Module({
  controllers: [UserController, UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
