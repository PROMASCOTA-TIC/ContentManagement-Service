import { IsOptional, IsString, IsUrl, IsNumber, IsDate } from 'class-validator';

export class UpdateFaqDto {
  @IsOptional()
  @IsNumber()
  categoryId: number; // ID de la categoría asociada

  @IsOptional()
  @IsString()
  title?: string; // Título del artículo

  @IsOptional()
  @IsString()
  description?: string; // Descripción del artículo

}