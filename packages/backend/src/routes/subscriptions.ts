import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import Stripe from 'stripe';
import { SUBSCRIPTION_PLANS, calculateSubscriptionAmount } from '@event-platform/shared';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const subscriptionSchema = z.object({
  tier: z.enum(['STARTER', 'PRO', 'PREMIER']),
  interval: z.enum(['monthly', 'yearly']),
});

// Create subscription
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  async (req, res, next) => {
    try {
      const { tier, interval } = subscriptionSchema.parse(req.body);
      const cityId = req.user!.cityId;

      const city = await prisma.city.findUnique({
        where: { id: cityId },
      });

      if (!city) {
        throw new AppError(404, 'City not found');
      }

      // Calculate subscription amount
      const amount = calculateSubscriptionAmount(tier, interval);

      // Create or get Stripe customer
      let stripeCustomerId = city.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: req.user!.email,
          metadata: {
            cityId,
          },
        });
        stripeCustomerId = customer.id;

        await prisma.city.update({
          where: { id: cityId },
          data: { stripeCustomerId },
        });
      }

      // Create subscription checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${SUBSCRIPTION_PLANS[tier].name} Plan - ${interval}`,
                description: SUBSCRIPTION_PLANS[tier].features.join(', '),
              },
              unit_amount: amount * 100, // Convert to cents
              recurring: {
                interval: interval === 'monthly' ? 'month' : 'year',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
        metadata: {
          cityId,
          tier,
        },
      });

      res.json({
        status: 'success',
        data: {
          sessionId: session.id,
          url: session.url,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Webhook handler for Stripe events
router.post('/webhook', async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      throw new AppError(400, 'No Stripe signature found');
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { cityId, tier } = session.metadata!;

        await prisma.city.update({
          where: { id: cityId },
          data: {
            subscriptionTier: tier as 'STARTER' | 'PRO' | 'PREMIER',
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const cityId = invoice.customer_email;

        // TODO: Implement notification system for failed payments
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

// Get subscription details
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  async (req, res, next) => {
    try {
      const cityId = req.user!.cityId;

      const city = await prisma.city.findUnique({
        where: { id: cityId },
        select: {
          subscriptionTier: true,
          stripeCustomerId: true,
        },
      });

      if (!city) {
        throw new AppError(404, 'City not found');
      }

      let subscription = null;

      if (city.stripeCustomerId) {
        const subscriptions = await stripe.subscriptions.list({
          customer: city.stripeCustomerId,
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          subscription = subscriptions.data[0];
        }
      }

      res.json({
        status: 'success',
        data: {
          tier: city.subscriptionTier,
          plan: SUBSCRIPTION_PLANS[city.subscriptionTier],
          subscription,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const subscriptionRouter = router; 