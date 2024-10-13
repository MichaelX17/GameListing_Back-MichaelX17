import { IsNotEmpty, IsString } from "class-validator";

export class GameNameDto {
    @IsNotEmpty()
    @IsString()
    name: string;
  }
  