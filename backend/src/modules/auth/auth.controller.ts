import { Controller, Post, Get, Body, Res, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: any;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Get current user
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      console.log('Current user 123:', req.user);
      const userId = req.user.userId;
      const user = await this.authService.getUserById(userId);
      console.log('Current user:', user);
      return res.status(HttpStatus.OK).send(user);
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Register API
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto, @Res() res: Response) {
    try {
      console.log('Received registration data:', registerDto);
      const response = await this.authService.register(registerDto);
      return res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(HttpStatus.BAD_REQUEST).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }

  // Login API
  @Post('login')
  async login(@Body() loginDto: LoginUserDto, @Res() res: Response) {
    try {
      const response = await this.authService.login(loginDto);
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }
}