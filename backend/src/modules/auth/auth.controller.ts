import { Controller, Post, Body, Res, HttpStatus, UseGuards, Get, Request, Logger, UnauthorizedException } from '@nestjs/common'; // Added Logger, UnauthorizedException
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Import the custom guard
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name); // Add logger instance

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
    this.logger.log(`--- Received login request for email: ${loginDto.email} ---`); // Added log
    try {
      const response = await this.authService.login(loginDto);
      this.logger.log(`--- Login successful for email: ${loginDto.email}, sending response ---`); // Added log
      
      // Add token property for frontend compatibility
      const responseWithToken = {
        ...response,
        token: response.accessToken
      };
      
      this.logger.log(`--- Response prepared with both accessToken and token properties ---`);
      return res.status(HttpStatus.OK).json(responseWithToken);
    } catch (error) {
      this.logger.error(`--- Login failed for email: ${loginDto.email} - Error: ${error.message} ---`, error.stack); // Enhanced error log
      // Determine appropriate status code based on error type if possible
      const status = error instanceof UnauthorizedException ? HttpStatus.UNAUTHORIZED : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({ status: 'error', message: error.message });
    }
  }

  // Get User Profile API
  @Get('me')
  @UseGuards(JwtAuthGuard) // Use the custom guard with logging
  getProfile(@Request() req) {
    // The user object is attached to the request by the AuthGuard
    // based on the JWT payload validation in jwt.strategy.ts
    return req.user;
  }
}
