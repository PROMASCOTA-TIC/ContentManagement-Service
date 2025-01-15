import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Dialect } from 'sequelize';
import { envs } from '../config';
import { ScheduleModule } from '@nestjs/schedule';
import { Faq } from './faqs/models/faqs.models';
import { FaqsModule } from './faqs/faqs.module';
import { Category } from './faqs/models/category.model';
import { Feedback } from './faqs/models/feedback.model';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    FaqsModule,
    SequelizeModule.forRoot({
      dialect: envs.dbDialect as Dialect,
      logging: console.log,
      username: envs.dbFaqsUsername,
      password: envs.dbFaqsPassword,
      synchronize: true,
      autoLoadModels: true, 
      dialectOptions: {
        connectString: envs.connectionString,
      },
      models: [Faq, Category, Feedback],
    })
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
console.log(envs);