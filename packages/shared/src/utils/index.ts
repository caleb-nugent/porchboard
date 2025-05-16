import { SubscriptionTier, SubscriptionPlan } from '../types';

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  STARTER: {
    tier: 'STARTER',
    name: 'Starter',
    price: {
      monthly: 49,
      yearly: 490,
    },
    features: [
      'Up to 100 events/month',
      'Basic analytics',
      'Email support',
      'Custom domain',
      'Basic branding options',
    ],
  },
  PRO: {
    tier: 'PRO',
    name: 'Professional',
    price: {
      monthly: 99,
      yearly: 990,
    },
    features: [
      'Up to 500 events/month',
      'Advanced analytics',
      'Priority support',
      'Custom domain',
      'Advanced branding options',
      'Event categories customization',
      'Multiple admin accounts',
    ],
  },
  PREMIER: {
    tier: 'PREMIER',
    name: 'Premier',
    price: {
      monthly: 199,
      yearly: 1990,
    },
    features: [
      'Unlimited events',
      'Real-time analytics',
      '24/7 priority support',
      'Custom domain',
      'Full branding customization',
      'API access',
      'White-label option',
      'Dedicated account manager',
    ],
  },
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateFileSize = (size: number, maxSize: number = 15 * 1024 * 1024): boolean => {
  return size <= maxSize;
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const isValidImageType = (mimeType: string): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimeType);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

export const calculateSubscriptionAmount = (
  tier: SubscriptionTier,
  interval: 'monthly' | 'yearly'
): number => {
  const plan = SUBSCRIPTION_PLANS[tier];
  return plan.price[interval];
}; 