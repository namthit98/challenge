import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

export interface IUserLogin {
  id: string;
  username: string;
  fullname: string;
  email: string;
  stripe_customer_id: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const secured = this.reflector.get<boolean | undefined>(
      'secured',
      context.getHandler(),
    );

    const classSecured = this.reflector.get<boolean | undefined>(
      'secured',
      context.getClass(),
    );

    if (secured === false) {
      return true;
    }

    if (secured === undefined) {
      if (!classSecured) return true;
    }

    const request = context.switchToHttp().getRequest();

    if (!request?.headers?.authorization) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'UNAUTHORIZED',
          data: null,
          error: 'UNAUTHORIZED',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = request.headers.authorization.replace(/Bearer/, '').trim();

    const tokenData = this.jwtService.decode(token) as {
      exp: number;
      iat: number;
      user_id: any;
    };

    if (!tokenData || tokenData.exp <= Math.floor(+new Date() / 1000)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Token is invalid',
          data: null,
          error: 'Token is invalid',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const data = await this.usersService.me(tokenData.user_id);

    if (!data) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'User is not found!',
          data: null,
          error: 'User is not found!',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    request.user = data;

    return true;
  }
}
