import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleModule } from '@nestjs/schedule';
import { Category } from './models/category.model';
import { FaqsController } from './faqs.controller';
import { FaqsService } from './faqs.service';
import { Faq } from './models/faqs.models';
import { Feedback } from './models/feedback.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Faq, Category, Feedback]),
  ],
  controllers: [FaqsController],
  providers: [FaqsService],
})
export class FaqsModule {}

