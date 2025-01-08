// DTO para la creación de AdminUser
import { IsArray, IsEmail, IsEnum, IsMongoId, IsNumberString, IsString, Length, Matches } from 'class-validator';
import { UserRole } from 'src/user/schemas/user.schema';

export enum AdminUserStatus {
    Active = 'Active',
    Inactive = 'Inactive',
  }

export class CreateAdminUserDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username must contain only letters and numbers.',
  })
  @Length(1, 20)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 30)
  password: string;

  @IsString()
  @Matches(/^[0-9]{6}$/, {
    message: 'Pin must be exactly 6 numeric characters.',
  })
  pin: string;

  @IsEnum(AdminUserStatus, { message: 'Status must be either "Active" or "Inactive".' })
  status: AdminUserStatus;

  @IsArray()
  @IsMongoId({ each: true })
  gameList: string[];

  @IsEnum(UserRole, { each: true })
  role: UserRole;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
