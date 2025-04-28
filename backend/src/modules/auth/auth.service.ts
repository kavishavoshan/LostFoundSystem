import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name); // Add logger instance

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Register new user or update if exists
  async register(registerDto: RegisterUserDto): Promise<{ status: string; message: string }> {
    const { name, email, password } = registerDto;
    this.logger.log(`Register/Update attempt for email: ${email}`);

    let user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      this.logger.log(`User with email ${email} found. Updating.`);
      // Update existing user - set plain password, BeforeUpdate hook handles hashing
      user.name = name;
      user.password = password; // Set plain password here
      this.logger.debug(`Updating user ID ${user.id}. Setting plain password (first 3 chars): ${password ? password.substring(0, 3) : 'undefined'}...`);
      // Note: Assuming RegisterUserDto might contain firstName/lastName, add them if needed
      // user.firstName = registerDto.firstName;
      // user.lastName = registerDto.lastName;
      await this.userRepository.save(user); // BeforeUpdate hook should hash the password
      this.logger.log(`User ${email} updated successfully.`);
      return { status: 'success', message: 'User updated successfully' };
    } else {
      this.logger.log(`User with email ${email} not found. Creating new user.`);
      // Create new user - pass plain password, BeforeInsert hook handles hashing
      user = this.userRepository.create({ name, email, password });
      // Note: Add firstName/lastName if they are part of RegisterUserDto and needed
      // user.firstName = registerDto.firstName;
      // user.lastName = registerDto.lastName;
      await this.userRepository.save(user);
      this.logger.log(`User ${email} created successfully.`);
      return { status: 'success', message: 'User registered successfully' };
    }
  }

  // Login user and generate JWT
  async login(loginDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;
    this.logger.log(`--- Login attempt started for email: ${email} ---`);
    this.logger.debug(`Login DTO received: ${JSON.stringify(loginDto)}`);

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`Login failed: User not found for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.debug(`User found: ${JSON.stringify({ id: user.id, email: user.email })}`); // Log user details except password

    this.logger.log(`Preparing to compare password for user ID: ${user.id}`);
    this.logger.debug(`Plain password provided (first 3 chars): '${password ? password.substring(0, 3) : 'undefined'}...'`);
    this.logger.debug(`Stored hash (first 10 chars): '${user.password ? user.password.substring(0, 10) : 'undefined'}...'`);
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
      this.logger.log(`Password comparison result for user ID ${user.id}: ${isPasswordValid}`);
    } catch (compareError) {
      this.logger.error(`Error during password comparison for user ID ${user.id}: ${compareError.message}`, compareError.stack);
      throw new UnauthorizedException('Error during authentication'); // Throw a generic error to avoid leaking details
    }

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    this.logger.log(`Login successful, JWT generated for user ID: ${user.id}`);

    return { accessToken };
  }
}
