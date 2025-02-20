import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserStatus, UserRole } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsernameDto } from './dto/username.dto';

@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('/signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const user: User = {
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password,
      status: UserStatus.Active,
      role: UserRole.User,
      pin: createUserDto.pin,
      gameList: [],
    };
    return this.userService.create(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Request() req) {
    if (!req.user || !req.user.username) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.userService.findOneByUsername(req.user.username);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async getAllUsers() {
    return this.userService.findAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update')
  async updateUser(@Request() req, @Body() updateUserDto: Record<string, any>) {
    if (!req.user || !req.user.username) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  
    // Lista de propiedades permitidas en el DTO
    const allowedFields = ['username', 'email', 'password', 'pin'];
  
    // Filtrar el objeto eliminando campos no permitidos
    const filteredData = Object.keys(updateUserDto)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateUserDto[key];
        return obj;
      }, {} as any);
  
    console.log("Fields after filtering: ", Object.keys(filteredData).length);
  
    // Si no hay campos válidos después de filtrar, lanzar error
    if (Object.keys(filteredData).length === 0) {
      throw new HttpException('Bad Request: No valid fields provided', HttpStatus.BAD_REQUEST);
    }
  
    const user = await this.userService.updateUser(req.user.userId, filteredData);
    if (!user) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
    return user;
  }
  


  @UseGuards(JwtAuthGuard)
  @Post('/delete')
  async deleteUser(@Request() req) {
    const result = await this.userService.deleteUser(req.user.userId);
    if (!result) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'User deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/username')
  async getUsersByUsername(@Body() usernameDto: UsernameDto) {
    return this.userService.findUserByUsername(usernameDto.username);
  }
}
