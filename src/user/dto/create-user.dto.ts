import { IsString, IsEmail, Length, IsNumberString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 20) // Ajusta la longitud según tus necesidades
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 100) // La contraseña debe tener al menos 6 caracteres y un máximo de 100
  password: string;

  @IsNumberString() // Asegura que solo se acepten caracteres numéricos
  @Length(6, 6) // Asegura que sea exactamente de 6 dígitos
  pin: string;
}
