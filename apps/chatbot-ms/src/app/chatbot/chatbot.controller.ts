import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatbotService } from './chatbot.service';

@Controller()
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  // Escucha el patrón 'chatbot_response'
  @MessagePattern('chatbot_response')
  async handleChatMessage(@Payload() data: { message: string }): Promise<string> {
    const { message } = data;

    if (!message) {
      throw new Error('El mensaje no puede estar vacío');
    }

    // Procesa el mensaje usando el servicio Hugging Face
    return await this.chatbotService.getChatResponse(message);
  }
}