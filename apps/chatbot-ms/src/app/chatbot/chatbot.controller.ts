import { Controller, Get, Query } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('chat')
  async getChatResponse(@Query('message') message: string): Promise<string> {
    if (!message) {
      throw new Error('The "message" query parameter is required.');
    }
    return await this.chatbotService.getChatResponse(message);
  }
}
