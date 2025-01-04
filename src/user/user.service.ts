import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema'; // Ajusta la importación según tu estructura
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

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
    if (findUsername) {
      throw new HttpException(
        'Username already in use',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.userModel.create(user);
  }

  async findAllUsers(): Promise<User[] | null> {
    const users = await this.userModel.find({ status: 'Active'}).exec();
    if (!users || users.length === 0 ){
      throw new HttpException('No Users Found', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateUser(id: string, updateUserDto: Partial<User>): Promise<User | null> {
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
}
