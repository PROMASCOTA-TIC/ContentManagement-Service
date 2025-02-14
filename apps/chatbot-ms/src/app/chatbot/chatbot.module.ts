import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ChatbotFeedback } from './models/chatbot-feedback.models';

@Module({
  imports: [
    SequelizeModule.forFeature([ChatbotFeedback]), // Agregar el modelo ChatbotFeedback a Sequelize
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
