import { IsString, IsEmail, Length, IsNumberString, IsEnum, Matches, IsArray, IsMongoId } from 'class-validator';

// Define el enum para el estado del usuario
enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

// DTO para la creación de un usuario
export class UpdateUserAsAdminDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username must contain only letters and numbers.',
  })
  @Length(1, 20) // El nombre de usuario debe tener entre 1 y 20 caracteres
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 30) // La contraseña debe tener entre 8 y 30 caracteres
  password: string;

  @IsString()
  @Matches(/^[0-9]{6}$/, {
    message: 'Pin must be exactly 6 numeric characters.',
  })
  pin: string;

  @IsEnum(UserStatus, {
    message: 'Status must be either "Active" or "Inactive".' })
  status: UserStatus; // Propiedad de tipo enum para el estado del usuario
}
