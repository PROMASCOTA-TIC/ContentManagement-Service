import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Dialect } from 'sequelize';
import { envs } from '../config';
import { ScheduleModule } from '@nestjs/schedule';
import { Category } from './advertorials/models/category.model';
import { Advertorial } from './advertorials/models/advertorial.models';
import { AdvertorialsModule } from './advertorials/advertorial.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AdvertorialsModule,
    SequelizeModule.forRoot({
      dialect: envs.dbDialect as Dialect,
      logging: console.log,
      username: envs.dbAdvertorialsUsername,
      password: envs.dbAdvertorialsPassword,
      synchronize: true,
      autoLoadModels: true, 
      dialectOptions: {
        connectString: envs.connectionString,
      },
      models: [Advertorial, Category],
    })
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
console.log(envs);