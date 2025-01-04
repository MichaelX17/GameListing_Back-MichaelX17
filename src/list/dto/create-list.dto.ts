import { IsString, Length, IsEnum, IsMongoId, IsArray, ValidateNested, IsNumber, Min, } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGameDto } from '../../game/dto/create-game.dto';
import { Game } from '../../game/schemas/game.schema';
import { CreateListGameDto } from './create-list-game.dto';

enum GenreEnum {
  Action = 'Action',
  Adventure = 'Adventure',
  RPG = 'RPG',
  Shooter = 'Shooter',
  Simulation = 'Simulation',
  Sports = 'Sports',
  Strategy = 'Strategy',
  Puzzle = 'Puzzle',
}

enum StatusEnum {
  Public = 'Public',
  Friends_Only = 'Friends_Only',
  Private = 'Private',
}

enum ProgressEnum {
  None = 'None',
  Started = 'Started',
  Mid = 'Mid',
  Finished = 'Finished',
}

export class CreateListDto {
  @IsString()
  @Length(3, 50) // Ajusta la longitud según los requisitos de la app.
  name: string;

  @IsNumber()
  @Min(0)
  order: number;

  @IsEnum(StatusEnum)
  status: StatusEnum;

  @IsEnum(ProgressEnum)
  progress: ProgressEnum;

  @IsEnum(GenreEnum)
  genre: GenreEnum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListGameDto)
  games: CreateListGameDto[];
}
