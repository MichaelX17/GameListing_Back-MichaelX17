import { IsString, Length, IsEnum, IsArray, ValidateNested, IsNotEmpty, IsOptional } from 'class-validator';
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

export class UpdateListDto {
  @IsOptional()
  @IsString()
  @Length(3, 50) // Ajusta la longitud según los requisitos de la app.
  name: string;

  @IsOptional()
  @IsEnum(SocialStatusEnum)
  socialStatus: SocialStatusEnum;

  @IsOptional()
  @IsEnum(RelevanceEnum)
  relevance: RelevanceEnum;

  @IsOptional()
  @IsEnum(GenreEnum)
  genre: GenreEnum;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListGameDto)
  games: ListGameDto[];
}
