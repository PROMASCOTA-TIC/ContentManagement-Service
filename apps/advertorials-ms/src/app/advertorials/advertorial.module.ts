import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleModule } from '@nestjs/schedule';
import { Category } from './models/category.model';
import { Advertorial } from './models/advertorial.models';
import { AdvertorialsService } from './advertorial.service';
import { AdvertorialsController } from './advertorial.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Advertorial, Category]),
    ScheduleModule.forRoot()
  ],
  controllers: [AdvertorialsController],
  providers: [AdvertorialsService],
})
export class AdvertorialsModule {}