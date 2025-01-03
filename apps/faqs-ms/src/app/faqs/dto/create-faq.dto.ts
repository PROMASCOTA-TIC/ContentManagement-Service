import { IsNotEmpty, IsString, IsUrl, IsNumber } from 'class-validator';

export class CreateFaqDto {
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