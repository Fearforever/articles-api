import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password'],
    });
  }

  create(username: string, password: string): Promise<User> {
    const user = this.usersRepository.create({ username, password });
    return this.usersRepository.save(user);
  }
}