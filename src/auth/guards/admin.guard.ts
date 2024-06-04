import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Role } from 'src/commons/enums/roles.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No autorizado, falta token');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
      //request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }
    if (request.user.role !== Role.ADMIN) {
      throw new UnauthorizedException('No autorizado');
    }
    return true;
  }
}
