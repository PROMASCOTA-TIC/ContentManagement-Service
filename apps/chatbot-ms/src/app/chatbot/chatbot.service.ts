import { Injectable, NotFoundException } from '@nestjs/common';
import { HfInference } from '@huggingface/inference';
import { envs } from '../../config';
import { ChatbotFeedback } from './models/chatbot-feedback.models';
import { ChatbotFeedbackDto } from './dto/chat-feedback.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

@Injectable()
export class ChatbotService {
  private readonly inference: HfInference;
  constructor(
    @InjectModel(ChatbotFeedback)
    private readonly chatbotFeedbackModel: typeof ChatbotFeedback,
  ) {
    this.inference = new HfInference(envs.chatbotToken);
  }

  /** 🔹 Obtener respuesta del chatbot */
  async getChatResponse(message: string): Promise<{ feedbackId: string; chatbotResponse: string }> {
    try {
      const stream = this.inference.chatCompletionStream({
        model: 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages: [{ role: 'user', content: message }],
        max_tokens: 451,
        stream: true,
      });

      let response = '';
      for await (const chunk of stream) {
        response += chunk.choices[0]?.delta?.content || '';
      }

      // **Solo guardar el mensaje del usuario y generar el UUID**
      const savedFeedback = await this.chatbotFeedbackModel.create({
        userMessage: message,
        rating: null, // Inicialmente sin feedback
      });

      return { feedbackId: savedFeedback.feedbackId, chatbotResponse: response };
    } catch (error) {
      throw new Error('Error al generar la respuesta del chatbot: ' + error.message);
    }
  }

  /** 🔹 Registrar feedback */
  async registerFeedback(feedbackDto: ChatbotFeedbackDto) {
    const { feedbackId, rating } = feedbackDto;

    // Buscar el feedback por ID
    const feedback = await this.chatbotFeedbackModel.findOne({ where: { feedbackId } });
    if (!feedback) {
      throw new NotFoundException('No se encontró el feedback con el ID proporcionado');
    }

    // Actualizar solo el rating
    feedback.rating = rating;
    await feedback.save();

    return { message: 'Feedback registrado exitosamente.' };
  }

  /** 🔹 Obtener estadísticas de feedback en un rango de fechas */
  async getWeeklyStats(startDate: string, endDate: string): Promise<{ totalVotes: number; positiveFeedback: number; negativeFeedback: number; satisfaction: string }> {
    // Convertir las fechas a objetos Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Contar votos positivos y negativos
    const positiveFeedback = await this.chatbotFeedbackModel.count({
      where: { rating: 1, createdAt: { [Op.between]: [start, end] } },
    });

    const negativeFeedback = await this.chatbotFeedbackModel.count({
      where: { rating: 0, createdAt: { [Op.between]: [start, end] } },
    });

    const totalVotes = positiveFeedback + negativeFeedback;
    const satisfaction = totalVotes > 0 ? ((positiveFeedback / totalVotes) * 100).toFixed(1) + "%" : "0.0%";

    return {
      totalVotes,
      positiveFeedback,
      negativeFeedback,
      satisfaction,
    };
  }
}