import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy'; // Import the JwtStrategy
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService
import { PassportModule } from '@nestjs/passport'; // Import PassportModule
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Import JwtAuthGuard

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), // Add PassportModule
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule here
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Load secret from .env
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') || '1h' }, // Load expiration from .env
      }),
      inject: [ConfigService], // Inject ConfigService
    }),
    ConfigModule, // Ensure ConfigModule is imported if not global or imported elsewhere needed by this module
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ConfigService, JwtAuthGuard], // Explicitly add JwtAuthGuard
  exports: [JwtModule, PassportModule], // Export JwtModule and PassportModule if needed by other modules
})
export class AuthModule {}
