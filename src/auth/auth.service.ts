import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from "../users/users.entity";
import { AuthUser } from "./interface/auth-user.interface";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const saltRounds = 12;

    const existing = await this.usersService.findByUsername(username);
    if (existing) throw new BadRequestException('Username already exists');

    const hashed = await bcrypt.hash(password, saltRounds);
    const user = await this.usersService.create(username, hashed);

    return this.generateToken(user);
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsernameWithPassword(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload: AuthUser = {
      id : user.id,
      username: user.username,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}