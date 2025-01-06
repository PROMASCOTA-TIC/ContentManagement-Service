import { IsNotEmpty, IsString, IsUrl, IsNumber, IsUUID } from 'class-validator';

export class CreateLinkDto {
  @IsUUID()
  @IsNotEmpty()
  linkId: string; // ID del enlace

  @IsNotEmpty()
  @IsString()
  ownerName: string; // Nombre del dueño de mascota o emprendedor

  @IsNotEmpty()
  @IsString()
  ownerEmail: string; // Nombre del dueño de mascota o emprendedor

  @IsNotEmpty()
  @IsNumber()
  categoryId: number; // ID de la categoría asociada

  @IsNotEmpty()
  @IsString()
  title: string; // Título del artículo

  @IsNotEmpty()
  @IsString()
  description: string; // Descripción del artículo

  @IsNotEmpty()
  @IsUrl()
  sourceLink: string; // Enlace fuente del artículo

  @IsUrl()
  @IsNotEmpty()
  itemUrl: string; //Enlace de imagenes
}