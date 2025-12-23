import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigRootModule } from './config/config.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [ConfigRootModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
