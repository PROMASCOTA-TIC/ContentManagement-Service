import { IsOptional, IsString, IsUrl, IsNumber, IsUUID, IsNotEmpty, IsDate, IsDateString } from 'class-validator';

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
  @IsDateString({}, { message: 'La fecha debe estar en formato ISO 8601' })
  publishDate?: string;

  @IsOptional()
  @IsString()
  imagesUrl: string; //Enlace de imagenes
}