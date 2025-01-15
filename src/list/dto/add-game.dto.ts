import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class AddGamesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true }) // Valida que cada elemento sea una cadena
  rawgIds: string[];
}
