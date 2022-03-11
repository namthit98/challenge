import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/authorization.guard';
import { PrismaService } from './common/prisma.service';
import { StripesModule } from './stripes/stripes.module';
import { StripesService } from './stripes/stripes.service';

@Module({
  imports: [UsersModule, StripesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    PrismaService,
    StripesService,
  ],
})
export class AppModule {}
