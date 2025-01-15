import { IsString, Length, IsEnum, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGameDto } from '../../game/dto/create-game.dto';
import { ListGameDto } from './list-game.dto';

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

enum SocialStatusEnum {
  Public = 'Public',
  Friends_Only = 'Friends_Only',
  Private = 'Private',
}

enum RelevanceEnum {
  High = 'High',
  Mid = 'Mid',
  Low = 'Low',
}

export class CreateListDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50) // Ajusta la longitud según los requisitos de la app.
  name: string;

  @IsNotEmpty()
  @IsEnum(SocialStatusEnum)
  socialStatus: SocialStatusEnum;

  @IsNotEmpty()
  @IsEnum(RelevanceEnum)
  relevance: RelevanceEnum;

  @IsNotEmpty()
  @IsEnum(GenreEnum)
  genre: GenreEnum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListGameDto)
  games: ListGameDto[];
}
