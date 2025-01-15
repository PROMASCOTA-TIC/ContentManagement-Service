import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from './models/category.model';
import { FaqsService } from './faqs.service';
import { Faq } from './models/faqs.models';
import { Feedback } from './models/feedback.model';
import { FaqsController } from './faqs.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Faq, Category, Feedback]),
  ],
  controllers: [FaqsController],
  providers: [FaqsService],
})
export class FaqsModule {}

