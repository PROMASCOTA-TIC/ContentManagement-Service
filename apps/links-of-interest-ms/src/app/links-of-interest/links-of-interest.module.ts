import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Link } from './models/link.models';
import { LinksOfInterestController } from './links-of-interest.controller';
import { LinksOfInterestService } from './links-of-interest.service';
import { ScheduleModule } from '@nestjs/schedule';
import { Category } from './models/category.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Link, Category]),
    ScheduleModule.forRoot()
  ],
  controllers: [LinksOfInterestController],
  providers: [LinksOfInterestService],
})
export class LinksOfInterestModule {}