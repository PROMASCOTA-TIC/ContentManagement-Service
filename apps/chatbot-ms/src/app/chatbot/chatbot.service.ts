import { Injectable } from '@nestjs/common';
import { HfInference } from '@huggingface/inference';
import { envs } from '../../config';


@Injectable()
export class ChatbotService {
  private readonly inference: HfInference;

  constructor() {
    // Inicializa la instancia de Hugging Face con el token validado
    this.inference = new HfInference(envs.chatbotToken);
  }

  async getChatResponse(message: string): Promise<string> {
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

    return response;
  }
}
