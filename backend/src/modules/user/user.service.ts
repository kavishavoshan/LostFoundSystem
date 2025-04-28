import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password, firstName, lastName } = createUserDto;
    
    // Check if user with this email already exists
    let user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      // Update existing user
      user.name = name;
      user.password = password; // Pass plain password, entity hook will hash
      user.firstName = firstName;
      user.lastName = lastName;
    } else {
      // Create new user
      user = this.userRepository.create({
        name,
        email,
        password: password, // Pass plain password, entity hook will hash
        firstName,
        lastName
      });
    }
    
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      // Provide more specific error context if possible
      const action = user.id ? 'update' : 'create';
      throw new Error(`Failed to ${action} user: ${error.message}`);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }
}
