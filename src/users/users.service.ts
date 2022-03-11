import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { StripesService } from '../stripes/stripes.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly stripeService: StripesService,
    private prisma: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existedUser = await this.prisma.user.findFirst({
      where: {
        username: createUserDto.username,
      },
    });

    if (existedUser) {
      throw new BadRequestException('Username is existed.');
    }

    const stripeCustomer = await this.stripeService.createCustomer(
      createUserDto.fullname,
      createUserDto.email,
    );

    if (!stripeCustomer) {
      throw new BadRequestException('Create customer failed');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(createUserDto.password, salt);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hash,
        stripe_customer_id: stripeCustomer.id,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        stripe_customer_id: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async login(loginUserDto: LoginUserDto) {
    const existedUser = await this.prisma.user.findFirst({
      where: { username: loginUserDto.username },
    });

    if (!existedUser) {
      throw new BadRequestException('Username is not existed.');
    }

    const isMatch = await bcrypt.compare(
      loginUserDto.password,
      existedUser.password,
    );

    if (!isMatch) {
      throw new BadRequestException('Password is wrong.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: existedUser.id },
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        stripe_customer_id: true,
        created_at: true,
        updated_at: true,
      },
    });

    const token = this.jwtService.sign(
      {
        user_id: user.id,
      },
      {
        expiresIn: 24 * 60 * 60,
      },
    );

    return {
      token,
      user,
    };
  }

  async me(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        stripe_customer_id: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user;
  }
}
