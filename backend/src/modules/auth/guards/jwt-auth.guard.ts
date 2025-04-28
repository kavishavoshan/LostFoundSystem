import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common'; // Add Logger and UnauthorizedException
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name); // Add logger instance

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    this.logger.log(`--- [Simplified] JwtAuthGuard invoked for path: ${request.path} ---`);
    this.logger.log(`--- [Simplified] Authorization Header: ${request.headers.authorization} ---`);
    
    // Temporarily bypass actual authentication logic to check if guard is hit
    // In a real scenario, you would call super.canActivate(context) here
    // For debugging, we just log and return true to see if the guard runs.
    // IMPORTANT: This bypasses security. Remove after debugging.
    // return true; 

    // Let's keep the original flow but log before it
    try {
      return super.canActivate(context) as boolean;
    } catch (error) {
      this.logger.error(`Error during super.canActivate: ${error.message}`, error.stack);
      throw error instanceof UnauthorizedException ? error : new UnauthorizedException(error.message || 'Authentication failed in canActivate');
    }
  }

  // Implement handleRequest to properly handle authentication results
  handleRequest(err, user, info, context, status) {
    this.logger.log(`handleRequest called. Error: ${err}, User: ${user ? 'Exists' : 'null'}, Info: ${info}, Status: ${status}`);
    if (err || !user) {
      this.logger.error(`Authentication failed in handleRequest. Info: ${info?.message || 'No info'}, Error: ${err?.message || 'No error'}`);
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }
    this.logger.log(`Authentication successful in handleRequest for user: ${JSON.stringify(user)}`);
    return user;
  }
}