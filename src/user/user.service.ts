import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { User, UserDocument, UserStatus } from './schemas/user.schema'; // Ajusta la importación según tu estructura
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  ////////////////////////////////
  //           Utils
  ////////////////////////////////

  async findAll(): Promise<User[] | null> {
    return await this.userModel.find({ status: 'Active' }).exec();;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return await this.userModel.findOne({ username }).exec();;;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  ////////////////////////////////
  //         Services
  ////////////////////////////////

  async findAllUsers(): Promise<User[] | null> {
    const users = await this.findAll();
    if (!users || users.length === 0) {
      throw new HttpException('No Users Found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  async create(user: User): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;

    const regex = /^[0-9]{6}$/;
    const isValidPin = regex.test(user.pin);
    if (!isValidPin) {
      throw new HttpException(
        'PIN must have exactly 6 digits and contain no letters',
        HttpStatus.BAD_REQUEST,
      );
    }

    const findUsername = await this.findOneByUsername(user.username);
    const findEmail = await this.findOneByEmail(user.email);
    if (findUsername) {
      throw new HttpException(
        'Username already in use',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (findEmail) {
      throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
    }
    return await this.userModel.create(user);
  }

  async updateUser(
    userId: string,
    updateUserDto: Partial<UpdateUserDto>,
  ): Promise<User> {
    // Validar si el usuario existe
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User not found.`);
    }

    // Validar username único si se está actualizando
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.findOneByUsername( updateUserDto.username );
      if (existingUser) {
        throw new BadRequestException(`Username is already taken.`);
      }
    }

    // Validar email único si se está actualizando
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.findOneByEmail( updateUserDto.email );
      if (existingEmail) {
        throw new BadRequestException(`Email is already in use.`);
      }
    }

    // Actualizar los campos válidos
    if (updateUserDto.username) user.username = updateUserDto.username;
    if (updateUserDto.email) user.email = updateUserDto.email;

    // Encriptar la contraseña antes de actualizar
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    if (updateUserDto.pin) user.pin = updateUserDto.pin;

    // Guardar los cambios
    await user.save();
    return user;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const users = await this.userModel
      .findOne({ username: username, status: 'Active' })
      .exec();
    if (!users) {
      throw new HttpException('No Users Found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users = await this.userModel
      .findOne({ email: email, status: 'Active' })
      .exec();
    if (!users) {
      throw new HttpException('No Users Found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  async deleteUser(id: string) {
    const result = await this.userModel
      .updateOne({ _id: id, status: UserStatus.Inactive })
      .exec();
    if (!result) {
      throw new HttpException('No Users Found', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}
