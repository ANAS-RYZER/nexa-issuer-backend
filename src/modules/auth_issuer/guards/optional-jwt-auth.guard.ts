import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Optional JWT Guard - Extracts user from JWT token if present
 * Does not throw error if token is missing or invalid
 * Used for endpoints that can work with or without authentication
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      // No token provided, continue without user
      return true;
    }

    try {
      const secret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'your-access-secret';
      const payload = this.jwtService.verify(token, { secret });

      // Attach user payload to request object if token is valid
      request['user'] = payload;
      return true;
    } catch (error) {
      // Token is invalid, continue without user
      return true;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
