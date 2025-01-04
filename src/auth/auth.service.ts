import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(usernameOrEmail: string, password: string): Promise<any> {
    const user = await this.userService.findOneByUsername(usernameOrEmail) ||
      await this.userService.findOneByEmail(usernameOrEmail);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(usernameOrEmail: string, password: string) {
    const user = await this.validateUser(usernameOrEmail, password);
    if (!user) {
      throw new Error('Unauthorized');
    }
    const payload = { username: user._doc.username, sub: user._doc._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }


}
