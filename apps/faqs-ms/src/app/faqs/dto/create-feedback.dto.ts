import { IsNotEmpty, IsOptional, IsString, IsInt, IsArray, IsUUID } from 'class-validator';

export class CreateFeedbackDto {
  @IsNotEmpty()
  @IsString()
  response: 'positivo' | 'negativo'; // Respuesta del usuario (obligatorio)
}