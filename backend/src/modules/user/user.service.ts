import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { name, email } = createUserDto;
    const user = this.userRepository.create({ name, email });
    return await this.userRepository.save(user);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }
}
