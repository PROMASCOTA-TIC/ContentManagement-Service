import { IsOptional, IsString, IsNumber, IsUUID, IsNotEmpty } from 'class-validator';

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