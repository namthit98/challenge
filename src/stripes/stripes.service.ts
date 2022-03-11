import Stripe from 'stripe';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { IUserLogin } from 'src/guards/authorization.guard';

const hosting_plans = [
  {
    id: '6572D0AE-854F-40CF-883F-B53FE63F51B3',
    name: 'Start',
    price: 10,
    ssd: 10,
    number_website: 1,
    number_email: 20,
  },
  {
    id: 'DDF4D5ED-6ACC-4246-8D28-6E9A98793DE5',
    name: 'Professional',
    price: 20,
    ssd: 100,
    number_website: 10,
    number_email: 200,
  },
  {
    id: 'CC308764-38E1-4C2F-9609-8064D7009E72',
    name: 'Enterprise',
    price: 35,
    ssd: 400,
    number_website: 99999999999,
    number_email: 1000,
  },
];

@Injectable()
export class StripesService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  async sync() {
    await this.prisma.hostingPlan.deleteMany();
    await this.prisma.hostingPlan.createMany({
      data: hosting_plans,
    });

    const product = await this.stripe.products.create({
      name: 'Hosting Plan',
    });

    hosting_plans.forEach(async (plan: any) => {
      const price = await this.stripe.prices.create({
        unit_amount: plan.price * 100,
        currency: 'usd',
        recurring: { interval: 'month' },
        product: product.id,
      });

      await this.prisma.hostingPlan.update({
        where: { id: plan.id },
        data: {
          price_stripe_id: price.id,
        },
      });
    });

    return {
      success: true,
    };
  }

  async createCheckoutSession(user: IUserLogin, planId: string) {
    const plan = await this.prisma.hostingPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) {
      throw new BadRequestException('Plan is not found');
    }

    const price = await this.stripe.prices.retrieve(plan.price_stripe_id);

    const session = await this.stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      customer: user.stripe_customer_id,
      client_reference_id: user.id,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `http://localhost:8000/api/v1/stripes/callback?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:8000/api/v1/stripes/callback?canceled=true`,
    });

    return session.url;
  }

  async retriveCheckoutSession(session_id: string) {
    const checkoutSession = await this.stripe.checkout.sessions.retrieve(
      session_id,
    );

    return checkoutSession;
  }

  async createCustomer(name: string, email: string) {
    const customer = await this.stripe.customers.create({
      name,
      email,
    });

    return customer;
  }

  async getSubscriptions(user: IUserLogin) {
    const { stripe_customer_id } = user;

    const subscriptions = await this.stripe.subscriptions.list({
      customer: stripe_customer_id,
      limit: 99,
    });

    return subscriptions.data.map((x: any) => ({
      id: x.id,
      plan_id: x.plan.id,
    }));
  }

  async cancelSubscription(user: IUserLogin, subscriptionId: string) {
    const { stripe_customer_id } = user;

    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId,
    );

    if (subscription && subscription.customer !== stripe_customer_id) {
      throw new BadRequestException('Subscription is not found.');
    }

    const deletedSub = await this.stripe.subscriptions.del(subscriptionId);

    return deletedSub?.id;
  }
}
