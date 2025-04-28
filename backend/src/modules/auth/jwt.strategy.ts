import { Injectable, Logger, UnauthorizedException, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm'; // Import InjectRepository
import { Repository } from 'typeorm'; // Import Repository
import { User } from '../user/user.entity'; // Corrected path

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) // Inject User repository
    private readonly userRepository: Repository<User>,
    @Inject(REQUEST) private request: any, // Inject request object
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret!,
      passReqToCallback: true, // Pass request to validate method
    });
    this.logger.log(`JwtStrategy initialized. Using JWT_SECRET: ${secret ? 'Loaded (' + secret.substring(0, 5) + '...)' : 'Not Loaded!'}`);
    this.logger.debug(`Passing secret to Passport Strategy: ${secret ? 'Exists' : 'MISSING!'}`);
  }

  async validate(req: any, payload: any) { // Receive request object
    this.logger.log(`--- Validating JWT for request: ${req.method} ${req.url} ---`);
    this.logger.debug(`Request Headers: ${JSON.stringify(req.headers)}`);
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    this.logger.debug(`Extracted Token: ${token ? token.substring(0, 10) + '...' : 'Not Found'}`);
    this.logger.log(`--- Attempting to validate JWT payload ---`);
    this.logger.debug(`Received payload for validation: ${JSON.stringify(payload)}`);
    if (!payload || !payload.userId) {
      this.logger.error('JWT payload is invalid or missing userId.');
      throw new UnauthorizedException('Invalid token payload - Missing userId');
    }

    // Validate user existence
    this.logger.log(`Attempting to find user with ID: ${payload.userId}`);
    const user = await this.userRepository.findOne({ where: { id: payload.userId } });
    if (!user) { 
      this.logger.error(`User validation failed - User ID ${payload.userId} not found in database.`);
      throw new UnauthorizedException('User associated with token not found'); 
    }
    
    // Exclude password from the returned user object
    const { password, ...result } = user;
    this.logger.log(`User ID ${user.id} validated successfully.`);
    this.logger.debug(`Validated user data (excluding password): ${JSON.stringify(result)}`);
    this.logger.log(`--- JWT validation successful ---`);
    return result; // Return validated user object without password
  }
}