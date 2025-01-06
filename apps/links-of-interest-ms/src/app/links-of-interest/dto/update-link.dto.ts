import { IsOptional, IsString, IsUrl, IsNumber, IsUUID, IsNotEmpty, IsDate } from 'class-validator';

export class UpdateLinkDto {
  @IsUUID()
  @IsNotEmpty()
  linkId: string; // ID del enlace

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

  @IsUrl()
  @IsNotEmpty()
  itemUrl: string; //Enlace de imagenes
}
