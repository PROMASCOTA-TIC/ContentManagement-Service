import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Dialect } from 'sequelize';
import { envs } from '../config';
import { Link } from './links-of-interest/models/link.models';
import { Category } from './links-of-interest/models/category.model';
import { LinksOfInterestModule } from './links-of-interest/links-of-interest.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LinksOfInterestModule,
    SequelizeModule.forRoot({
      dialect: envs.dbDialect as Dialect,
      logging: console.log,
      username: envs.dbLinksUsername,
      password: envs.dbLinksPassword,
      synchronize: true,
      autoLoadModels: true, 
      dialectOptions: {
        connectString: envs.connectionString,
      },
      models: [Link, Category],
    })
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
console.log(envs);