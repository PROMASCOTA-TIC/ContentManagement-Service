import { Controller, BadRequestException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatbotService } from './chatbot.service';
import { ChatbotFeedbackDto, ChatMessageDto } from './dto/chat-feedback.dto';

@Controller()
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) { }

  /** 🔹 Obtener respuesta del chatbot */
  @MessagePattern('chatbot_response')
  async getChatResponse(@Payload() chatMessageDto: ChatMessageDto) {
    if (!chatMessageDto.message) {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }
    return this.chatbotService.getChatResponse(chatMessageDto.message);
  }

  /** 🔹 Registrar feedback */
  @MessagePattern('chatbot_feedback')
  async registerFeedback(@Payload() feedbackDto: ChatbotFeedbackDto) {
    return this.chatbotService.registerFeedback(feedbackDto);
  }


  /** 🔹 Obtener estadísticas del chatbot en un rango de fechas */
  @MessagePattern('chatbot_stats')
  async getWeeklyStats(@Payload() data: { startDate: string; endDate: string }) {
    const { startDate, endDate } = data;

    if (!startDate || !endDate) {
      throw new BadRequestException('Debe proporcionar startDate y endDate en formato YYYY-MM-DD');
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      throw new BadRequestException('Las fechas proporcionadas no son válidas');
    }

    if (parsedStartDate > parsedEndDate) {
      throw new BadRequestException('startDate no puede ser mayor que endDate');
    }

    return this.chatbotService.getWeeklyStats(startDate, endDate);
  }
}
