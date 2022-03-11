import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Authorization } from './decorators/authorization.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { CreateCheckoutSesssion } from './dto/create-checkout-session.dto';
import { IUserLogin } from './guards/authorization.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/plans')
  getPlans() {
    return this.appService.getPlans();
  }

  @Authorization(true)
  @Get('/subscriptions')
  getSubscriptions(@CurrentUser() user: IUserLogin) {
    return this.appService.getSubsciptions(user);
  }

  @Authorization(true)
  @Post('/subscriptions/create-session')
  async createCheckoutSession(
    @Body() createCheckoutSesssion: CreateCheckoutSesssion,
    @CurrentUser() user: IUserLogin,
  ) {
    return this.appService.createCheckoutSession(
      user,
      createCheckoutSesssion.planId,
    );
  }

  @Authorization(true)
  @Delete('/subscriptions/:subscriptionId')
  cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @CurrentUser() user: IUserLogin,
  ) {
    return this.appService.cancelSubscription(user, subscriptionId);
  }
}
