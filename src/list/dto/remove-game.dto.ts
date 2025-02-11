import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class RemoveGamesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true }) // Valida que cada elemento sea una cadena
  rawgIds: string[];
}
