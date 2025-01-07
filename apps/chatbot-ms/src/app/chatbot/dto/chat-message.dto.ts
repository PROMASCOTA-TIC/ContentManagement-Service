import { IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageDto {
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @IsString({ message: 'El mensaje debe ser un texto' })
  message: string;
}