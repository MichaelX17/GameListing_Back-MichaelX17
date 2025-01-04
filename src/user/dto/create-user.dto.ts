import { IsString, IsEmail, Length, IsNumberString, IsEnum } from 'class-validator';

// Define el enum para el estado del usuario
export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

// DTO para la creación de un usuario
export class CreateUserDto {
  @IsString()
  @Length(3, 20) // El nombre de usuario debe tener entre 3 y 20 caracteres
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 100) // La contraseña debe tener entre 6 y 100 caracteres
  password: string;

  @IsNumberString() // Acepta solo caracteres numéricos
  @Length(6, 6) // Asegura que sea exactamente de 6 dígitos
  pin: string;

  @IsEnum(UserStatus, { message: 'Status must be either "Active" or "Inactive"' })
  status: UserStatus; // Propiedad de tipo enum para el estado del usuario
}
