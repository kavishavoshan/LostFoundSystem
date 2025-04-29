import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  // Get user by ID
  async getUserById(userId: string): Promise<any> {
    try {
      const user = await this.userModel.findById(userId).exec();
      console.log('User found:', user);
      if (!user) {
        throw new NotFoundException('User not found');
      }
     
      
      // Convert to plain object and remove sensitive data
      const userObj =  user.toObject();
      console.log('User object:', userObj);
      const { password, ...userWithoutPassword } = userObj;
      console.log('User without password:', userWithoutPassword);
      
      return userWithoutPassword;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  // Register new user
  async register(registerDto: RegisterUserDto): Promise<{ accessToken: string; user: User }> {
    console.log('AuthService received registration data:', registerDto);
    const { name, email, password, mobileNumber, contact } = registerDto;
    console.log('Extracted mobile number:', mobileNumber);
    console.log('Extracted contact:', contact);

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ 
      $or: [
        { email },
        ...(mobileNumber ? [{ mobileNumber }] : []),
        ...(contact ? [{ contact }] : [])
      ]
    });
    if (existingUser) {
      throw new ConflictException(
        existingUser.email === email 
          ? 'Email already registered' 
          : existingUser.mobileNumber === mobileNumber
            ? 'Mobile number already registered'
            : 'Contact already registered'
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      contact,
    });

    await user.save();

    // Generate JWT token
    const payload = { sub: user._id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: user.toJSON(),
    };
  }

  // Login user and generate JWT
  async login(loginDto: LoginUserDto): Promise<{ accessToken: string; user: User }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user._id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: user.toJSON(),
    };
  }
}
