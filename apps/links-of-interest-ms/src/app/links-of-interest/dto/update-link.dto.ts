import { IsOptional, IsString, IsUrl, IsNumber, IsUUID, IsNotEmpty, IsDate } from 'class-validator';
import { IsIn } from 'sequelize-typescript';

export class UpdateLinkDto {
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
  sourceLink?: string; // Enlace fuente del articulo
  
  @IsOptional()
  @IsDate()
  publishDate?: Date; // Campo para la fecha de publicación

  @IsOptional()
  @IsUrl()
  imagesUrl: string; //Enlace de imagenes
}