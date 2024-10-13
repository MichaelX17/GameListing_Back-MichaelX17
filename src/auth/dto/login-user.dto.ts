import { IsString, Length } from "class-validator";

export class LoginUserDto {
    @IsString()
    usernameOrEmail: string;

    @IsString()
    @Length(6, 100)
    password: string;
  }
  