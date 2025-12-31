import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { validate } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //If "true", the ConfigModule will registers as a global module in application. can be accessable in any module
      load: [configuration], //this is the file where we loaded the objects
      envFilePath: '.env', //In production server use your desired env filename Ex.production.env in place of .env
      validate,
    }),
  ],
})
export class ConfigRootModule {}
