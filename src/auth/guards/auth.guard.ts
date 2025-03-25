import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  private isRoutePublic(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private isAuthenticated(
    context: ExecutionContext,
  ): boolean | Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const jwt = this.authService.extractJwtFromCookies(request);

    if (!jwt) return false;

    return this.authService.isJwtValid(jwt);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isRoutePublic(context)) return true;
    if (!this.authService.isWebsitePasswordSet()) return true;

    return this.isAuthenticated(context);
  }
}
