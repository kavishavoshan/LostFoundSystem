import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      console.log('[WsJwtAuthGuard] Client Handshake Auth:', client.handshake.auth); // Log handshake auth
      
      // Extract token from handshake auth data, not headers
      const token = client.handshake.auth?.token;
      
      // More detailed logging for token extraction
      if (!token) {
        console.error('[WsJwtAuthGuard] No token found in handshake auth data');
        console.log('[WsJwtAuthGuard] Handshake data:', JSON.stringify(client.handshake));
        throw new WsException('Unauthorized: Missing token');
      }
      
      console.log('[WsJwtAuthGuard] Extracted Token:', token.substring(0, 15) + '...');
      
      try {
        const payload = await this.jwtService.verifyAsync(token);
        console.log('[WsJwtAuthGuard] Verified Payload:', payload); // Log verified payload
        
        // Ensure the payload has the expected structure
        if (!payload || !payload.sub) {
          console.error('[WsJwtAuthGuard] Invalid token payload structure:', payload);
          throw new WsException('Unauthorized: Invalid token payload');
        }
        
        // Assign the user ID from the token payload (sub field) to client.data
        client.data = client.data || {}; // Ensure client.data exists
        client.data.userId = payload.sub;
        console.log('[WsJwtAuthGuard] Successfully authenticated user:', payload.sub);
        
        return true;
      } catch (jwtError) {
        console.error('[WsJwtAuthGuard] JWT Verification Error:', jwtError.message);
        throw new WsException('Unauthorized: Invalid token');
      }
    } catch (error) { // Catch specific error
      console.error('[WsJwtAuthGuard] Authentication Error:', error.message); // Log the error
      throw new WsException(error.message || 'Unauthorized');
    }
  }
}