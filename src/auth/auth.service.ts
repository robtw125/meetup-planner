import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? 'token';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  private getWebsitePassword(): string | undefined {
    return process.env.PASSWORD;
  }

  private generateJwt(): Promise<string> {
    const payload = {};
    return this.jwtService.signAsync(payload);
  }

  private async grantAccess(response: Response) {
    const jwt = await this.generateJwt();

    response.status(201);
    response.cookie(JWT_COOKIE_NAME, jwt);
    response.send();
  }

  async login(response: Response, password: string): Promise<void> {
    const websitePassword = this.getWebsitePassword();

    if (websitePassword && password === websitePassword)
      return this.grantAccess(response);

    throw new UnauthorizedException();
  }

  isWebsitePasswordSet() {
    return this.getWebsitePassword() ? true : false;
  }

  extractJwtFromCookies(request: Request): string | null {
    let jwt: string | null = null;

    if (request && request.cookies) {
      jwt = request.cookies[JWT_COOKIE_NAME] as string;
    }

    return jwt;
  }

  async isJwtValid(jwt: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(jwt);
      return payload ? true : false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
