import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigRootModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [ConfigRootModule, DatabaseModule, UsersModule, OrganizationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
