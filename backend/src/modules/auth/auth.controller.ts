import { Controller, Post, Body, Res, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register API
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto, @Res() res: Response) {
    try {
      const response = await this.authService.register(registerDto);
      return res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  // Login API
  @Post('login')
  async login(@Body() loginDto: LoginUserDto, @Res() res: Response) {
    try {
      const response = await this.authService.login(loginDto);
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ status: 'error', message: error.message });
    }
  }

  // Get current user API
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Req() req) {
    try {
      const user = await this.authService.getCurrentUser(req.user.userId);
      return user;
    } catch (error) {
      throw error;
    }
  }
}
