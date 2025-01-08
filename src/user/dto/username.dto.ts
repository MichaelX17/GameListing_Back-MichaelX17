import { IsString, IsEmail, Length, IsNumberString, IsEnum, Matches, IsArray, IsMongoId } from 'class-validator';

// DTO para la creación de un usuario
export class UsernameDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username must contain only letters and numbers.',
  })
  @Length(1, 20) // El nombre de usuario debe tener entre 1 y 20 caracteres
  username: string;
}
