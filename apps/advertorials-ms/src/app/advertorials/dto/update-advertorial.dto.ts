import { IsOptional, IsString, IsUrl, IsNumber, IsDate } from 'class-validator';

export class UpdateAdvertorialDto {
  @IsOptional()
  @IsNumber()
  categoryId: number; // ID de la categoría asociada

  @IsOptional()
  @IsString()
  title?: string; // Título del artículo

  @IsOptional()
  @IsString()
  description?: string; // Descripción del artículo

  @IsOptional()
  @IsUrl()
  sourceLink?: string; // Enlace fuente del artículo
  
  @IsOptional()
  @IsDate()
  publishDate?: Date; // Campo para la fecha de publicación
}