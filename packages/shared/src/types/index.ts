export type UserRole = 'ADMIN' | 'EVENT_CREATOR' | 'VISITOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cityId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  domain: string;
  branding: CityBranding;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface CityBranding {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  footerText: string;
}

export type SubscriptionTier = 'STARTER' | 'PRO' | 'PREMIER';

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: Location;
  images: string[];
  externalLink?: string;
  category: string;
  cityId: string;
  creatorId: string;
  status: EventStatus;
  recurrence?: EventRecurrence;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

export type EventStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

export interface EventRecurrence {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  endDate?: Date;
}

export interface Attachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
}

export interface Analytics {
  cityId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalEvents: number;
    approvedEvents: number;
    rejectedEvents: number;
    flaggedEvents: number;
    totalViews: number;
    uniqueVisitors: number;
  };
} 