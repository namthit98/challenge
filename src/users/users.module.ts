import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../common/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from 'src/common/jwt-config.service';
import { StripesService } from '../stripes/stripes.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, StripesService],
  exports: [UsersService, JwtModule],
})
export class UsersModule {}
