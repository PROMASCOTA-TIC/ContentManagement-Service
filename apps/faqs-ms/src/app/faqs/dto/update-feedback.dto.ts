import { IsArray, IsInt, IsOptional, IsString } from "class-validator";

export class UpdateFeedbackDto {
    @IsOptional()
    @IsInt()
    rating?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    selectedOptions?: string[];

    @IsOptional()
    @IsString()
    additionalComments?: string;
}