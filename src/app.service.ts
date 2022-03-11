import { Injectable } from '@nestjs/common';
import { PrismaService } from './common/prisma.service';
import { IUserLogin } from './guards/authorization.guard';
import { StripesService } from './stripes/stripes.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private stripesService: StripesService,
  ) {}

  getPlans() {
    return this.prisma.hostingPlan.findMany();
  }

  createCheckoutSession(user, planId) {
    return this.stripesService.createCheckoutSession(user, planId);
  }

  getSubsciptions(user: IUserLogin) {
    return this.stripesService.getSubscriptions(user);
  }

  cancelSubscription(user: IUserLogin, subscriptionId: string) {
    return this.stripesService.cancelSubscription(user, subscriptionId);
  }
}
