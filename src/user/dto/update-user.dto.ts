import { IsString, IsEmail, Length, Matches, IsOptional, ValidateIf } from 'class-validator';

export class UpdateUserDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username must contain only letters and numbers.',
  })
  @Length(1, 20)
  @IsOptional()
  username: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsEmail()
  @IsOptional()
  email: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(8, 30)
  @IsOptional()
  password: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(/^[0-9]{6}$/, {
    message: 'Pin must be exactly 6 numeric characters.',
  })
  @IsOptional()
  pin: string;
}
