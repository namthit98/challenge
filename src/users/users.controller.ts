import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    if (!user) {
      throw new BadRequestException('Create user failed.');
    }

    delete user.password;

    return {
      data: user,
      statusCode: HttpStatus.OK,
      message: 'Create user successfully!',
      error: null,
    };
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('/login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }
}
