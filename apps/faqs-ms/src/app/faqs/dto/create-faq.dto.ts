import { IsNotEmpty, IsString, IsNumber, IsUUID } from 'class-validator';

export class CreateFaqDto {
  @IsUUID()
  @IsNotEmpty()
  faqId: string; // ID del faq

  @IsNotEmpty()
  @IsNumber()
  categoryId: number; // ID de la categoría asociada

  @IsNotEmpty()
  @IsString()
  title: string; // Título del artículo

  @IsNotEmpty()
  @IsString()
  description: string; // Descripción del artículo
}