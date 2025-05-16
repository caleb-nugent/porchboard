# Event Discovery Platform

A white-labeled, multi-tenant event discovery platform for cities and small towns. This platform enables cities to have their own branded event portals while sharing a common infrastructure.

## Features

### For Cities (Tenants)
- Custom branding (logo, colors, domain, font, footer)
- Multiple subscription tiers (Starter, Pro, Premier)
- Analytics dashboard
- Event management and moderation
- Data export capabilities

### For Event Creators
- Event submission with rich details
- File attachments support
- Event management dashboard
- Draft system

### For Visitors
- Browse events in multiple views (list, grid, map)
- Advanced filtering and search
- Mobile-responsive interface
- Accessibility compliance (WCAG 2.1 AA)

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **File Storage**: AWS S3
- **Authentication**: NextAuth.js
- **Payment Processing**: Stripe
- **Email**: SendGrid
- **Deployment**: Docker, AWS

## Project Structure

```
.
├── packages/
│   ├── frontend/     # Next.js application
│   ├── backend/      # Express API server
│   └── shared/       # Shared types and utilities
├── package.json      # Root package.json
└── turbo.json        # Turborepo configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18
- Yarn
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp packages/frontend/.env.example packages/frontend/.env
   cp packages/backend/.env.example packages/backend/.env
   ```

4. Start the development servers:
   ```bash
   yarn dev
   ```

## Environment Variables

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/eventdb
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
STRIPE_SECRET_KEY=
SENDGRID_API_KEY=
```

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
