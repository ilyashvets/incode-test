import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from 'shared/interface';
import { IS_PUBLIC_KEY } from 'shared/decorator';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request: AuthRequest = context.switchToHttp().getRequest();
    const { cookie } = request.headers;

    if (!cookie || !cookie.includes('monkey'))
      throw new UnauthorizedException();

    const accessToken = cookie
      .split('; ')
      .find((s) => s.startsWith('monkey'))
      .split('=')[1];

    const secret: string = this.configService.get('JWT_SECRET');

    try {
      request.user = await this.jwtService.verifyAsync(accessToken, { secret });
      return true;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
