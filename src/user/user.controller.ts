import { Controller, Post, Get, Put, Delete, Body, Param, Request, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService
    ) {}

  @Post('/signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const user: User = {
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password,
      status: 'Active',
      pin: createUserDto.pin,
      gameList: [],
    };
    return this.userService.create(user);
  }

  @Post('/login')
  async login(@Body() loginDto: LoginUserDto) {
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    if (!req.user || !req.user.username) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.userService.findOneByUsername(req.user.username);
  }
  
  @Put('update/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    const user = await this.userService.updateUser(id, updateUserDto);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id') id: string) {
    const result = await this.userService.deleteUser(id);
    if (!result) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'User deleted successfully' };
  }
}
