import { IsNotEmpty, IsOptional, IsString, IsInt, IsArray, IsUUID } from 'class-validator';

export class CreateFeedbackDto {
  @IsUUID()
  @IsNotEmpty()
  feedbackId: string; // ID del faq

  @IsNotEmpty()
  @IsString()
  response: 'positivo' | 'negativo'; // Respuesta del usuario (obligatorio)

  @IsOptional()
  @IsInt()
  rating?: number; // Calificación (opcional)

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedOptions?: string[]; // Opciones seleccionadas (opcional)

  @IsOptional()
  @IsString()
  additionalComments?: string; // Comentarios adicionales (opcional)
}