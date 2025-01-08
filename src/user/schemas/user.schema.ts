import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsEnum,  IsAlphanumeric, Length, Matches, IsArray, IsMongoId, IsEmail, } from 'class-validator';

export type UserDocument = User & Document;

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  User = 'User'
}

@Schema()
export class User {
  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: (v: string) => /^[a-zA-Z0-9]{1,20}$/.test(v),
      message:
        'Username must contain only letters and numbers and be up to 20 characters long.',
    },
  })
  @IsAlphanumeric()
  @Length(3, 20)
  username: string;

  @Prop({ required: true })
  @IsEmail()
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    default: UserStatus.Active,
    enum: UserStatus,
  })
  @IsEnum(UserStatus)
  status: UserStatus;

  @Prop({
    default: UserRole.User,
    enum: UserRole,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @Prop({
    required: true,
    validate: {
      validator: (v: string) => /^[0-9]{6}$/.test(v),
      message: 'Pin must be exactly 6 numeric characters.',
    },
  })
  @Matches(/^[0-9]{6}$/)
  pin: string;

  @Prop({
    type: [String],
    validate: {
      validator: (v: string[]) => v.every((id) => /^[a-f\d]{24}$/i.test(id)),
      message: 'Each item in gameList must be a valid MongoId.',
    },
  })
  @IsArray()
  @IsMongoId({ each: true })
  gameList: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
