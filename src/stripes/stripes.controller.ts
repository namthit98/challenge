import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateCheckoutSesssion } from '../dto/create-checkout-session.dto';
import { StripesService } from './stripes.service';
import { Authorization } from '../decorators/authorization.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { IUserLogin } from 'src/guards/authorization.guard';

@Controller('stripes')
export class StripesController {
  constructor(private readonly stripesService: StripesService) {}

  @Get('/sync')
  async sync() {
    return this.stripesService.sync();
  }

  @Get('/callback')
  async sessionCallback(@Query() query: any) {
    if (query.success !== 'true') {
      return {
        success: false,
      };
    }
    const data = await this.stripesService.retriveCheckoutSession(
      query.session_id,
    );

    if (data && data.payment_status === 'paid' && data.status === 'complete') {
      return {
        success: true,
      };
    }

    return {
      success: false,
    };
  }
}
