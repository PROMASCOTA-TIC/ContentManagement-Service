import { IsNotEmpty, IsUUID, IsNumber, Min, Max, IsInt, IsString, IsOptional } from 'class-validator';

export class ChatMessageDto {
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  message: string;
}

export class ChatbotFeedbackDto {
  @IsUUID() // Verifica que es un UUID válido
  @IsNotEmpty({ message: 'El ID de la respuesta es obligatorio' })
  feedbackId: string; // UUID generado al crear la pregunta
  
  @IsInt({ message: 'El rating debe ser un número entero' })
  @Min(0, { message: 'El rating solo puede ser 0 (negativo) o 1 (positivo)' })
  @Max(1, { message: 'El rating solo puede ser 0 (negativo) o 1 (positivo)' })
  rating: number; // 1 = positivo, 0 = negativo
}

export class WeeklyPerformanceDto {
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  startDate: string;

  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  endDate: string;
}