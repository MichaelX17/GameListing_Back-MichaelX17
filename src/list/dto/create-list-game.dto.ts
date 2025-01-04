import { IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { ProgressEnum } from '../../game/schemas/game.schema';

export class CreateListGameDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  rating: number;

  @IsNumber()
  @Min(0)
  hours: number;

  @IsNumber()
  @Min(0)
  average: number;

  @IsEnum(ProgressEnum)
  progress: ProgressEnum;
}
