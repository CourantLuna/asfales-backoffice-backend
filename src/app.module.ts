import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './controllers/users.controller';
import { AuthModule } from './modules/auth.module';


@Module({
  imports: [AuthModule],
  controllers: [AppController,UsersController],
  providers: [AppService],
})
export class AppModule {}
