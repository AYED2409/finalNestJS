import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { SigIn } from './dto/sigIn.dto';
import * as bcryptjs from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ username, email, password }: RegisterDto) {
    const user = await this.userService.findOneByEmail(email);
    if (user) {
      throw new ConflictException('email already registered');
    }
    const userUsername = await this.userService.findOneByUsername(username);
    if (userUsername) {
      throw new ConflictException('existing username');
    }
    return await this.userService.create({
      username,
      email,
      password,
    });
  }

  async sigIn(sigIn: SigIn) {
    const user = await this.userService.findOneEmail(sigIn.email);
    if (!user) {
      throw new BadRequestException('Unregistered user');
    }
    const isPasswordValid = await bcryptjs.compare(
      sigIn.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('invalid credentials');
    }
    const payload = {
      email: user.email,
      username: user.username,
      id: user.id,
      role: user.role,
      image: user.image,
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      token,
      id: user.id,
      role: user.role,
      email: sigIn.email,
      username: user.username,
      image: user.image,
    };
  }
}
