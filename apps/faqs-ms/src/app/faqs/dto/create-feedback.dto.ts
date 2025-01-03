import { IsNotEmpty, IsOptional, IsString, IsInt, IsArray } from 'class-validator';

export class CreateFeedbackDto {
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