import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Dialect } from 'sequelize';
import { envs } from '../config';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatbotModule } from './chatbot/chatbot.module';
import { ChatbotFeedback } from './chatbot/models/chatbot-feedback.models';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ChatbotModule,
    SequelizeModule.forRoot({
      dialect: envs.dbDialect as Dialect,
      logging: console.log,
      username: envs.dbChatbotUsername,
      password: envs.dbChatbotPassword,
      synchronize: true,
      autoLoadModels: true, 
      dialectOptions: {
        connectString: envs.connectionString,
      },
      models: [ChatbotFeedback],
    })
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
console.log(envs);