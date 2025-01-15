import { IsString, IsNumber, IsArray, IsEnum, IsOptional, Length, Min, IsNotEmpty } from 'class-validator';

enum ProgressEnum {
  None = 'None',
  InProgress = 'InProgress',
  Finished = 'Finished',
}

export class CreateGameDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  rawgId: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rating: number;

  @IsNotEmpty()
  @IsString()
  released: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  average: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  playtime: number;

  @IsNotEmpty()
  @IsString()
  background_image: string;

  @IsNotEmpty()
  @IsString()
  background_image_additional: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  developers: string[];
}
