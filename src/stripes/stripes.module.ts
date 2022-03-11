import { Module } from '@nestjs/common';
import { StripesService } from './stripes.service';
import { StripesController } from './stripes.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [StripesController],
  providers: [StripesService, PrismaService],
})
export class StripesModule {}
