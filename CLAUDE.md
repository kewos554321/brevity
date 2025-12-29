# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brevity is a URL shortening service built with Next.js. It allows users to create shortened URLs, track click analytics, and manage their links.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes (App Router), Prisma ORM, PostgreSQL
- **Deployment**: Vercel (fullstack monorepo)
- **Auth**: (TBD - NextAuth recommended)

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma generate  # Generate Prisma client
npx prisma migrate dev    # Run database migrations (development)
npx prisma migrate deploy # Run database migrations (production)
npx prisma studio    # Open Prisma Studio GUI
npx prisma db push   # Push schema changes without migration
```

## Architecture

### Directory Structure

```
/app
  /[shortCode]    - Dynamic route for URL redirection
  /api            - API routes
    /shorten      - Create shortened URL
    /links        - CRUD operations for links
    /analytics    - Click tracking and statistics
  /dashboard      - User dashboard for link management
/components
  /ui             - shadcn/ui components (button, input, card, etc.)
  /...            - Custom application components
/lib
  /db.ts          - Prisma client singleton
  /utils.ts       - Utility functions (cn helper for Tailwind)
/prisma           - Database schema and migrations
/types            - TypeScript type definitions
```

### shadcn/ui Components

Use `npx shadcn@latest add <component>` to add new components. Common components for this project:
- `button`, `input`, `card` - Form and layout basics
- `toast`, `sonner` - Notifications
- `dialog`, `alert-dialog` - Modals
- `table`, `data-table` - Link listing
- `skeleton` - Loading states
- `dropdown-menu` - Actions menu

### Data Model (Prisma Schema)

```prisma
model Link {
  id          String   @id @default(cuid())
  shortCode   String   @unique
  originalUrl String
  title       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  expiresAt   DateTime?
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  clicks      Click[]
  isActive    Boolean  @default(true)
}

model Click {
  id        String   @id @default(cuid())
  linkId    String
  link      Link     @relation(fields: [linkId], references: [id], onDelete: Cascade)
  timestamp DateTime @default(now())
  referrer  String?
  userAgent String?
  ipHash    String?  // Hashed for privacy
  country   String?
  city      String?
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  links     Link[]
  createdAt DateTime @default(now())
}
```

### API Route Patterns

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shorten` | Create new short URL |
| GET | `/api/links` | List user's links |
| GET | `/api/links/[id]` | Get link details |
| PATCH | `/api/links/[id]` | Update link |
| DELETE | `/api/links/[id]` | Delete link |
| GET | `/api/analytics/[id]` | Get link analytics |

### Key Implementation Details

- **Short code generation**: Use nanoid or custom Base62 encoding (6-8 characters)
- **Path alias**: `@/*` maps to project root
- **Redirection**: Use 301 (permanent) or 302 (temporary) redirects at `/[shortCode]`
- **Rate limiting**: Implement per-IP rate limiting for link creation
- **URL validation**: Validate URLs before accepting (check format, block malicious domains)
- **Click tracking**: Record analytics asynchronously to not delay redirects

### Security Considerations

1. **URL Validation**
   - Validate URL format with URL constructor
   - Check against known malicious domain lists
   - Block localhost/internal IPs
   - Sanitize URLs to prevent XSS

2. **Rate Limiting**
   - Limit link creation per IP/user
   - Limit redirect requests to prevent abuse

3. **Privacy**
   - Hash IP addresses before storing
   - Comply with GDPR for analytics data
   - Provide option to disable tracking

4. **Short Code Security**
   - Use cryptographically secure random generation
   - Avoid sequential or predictable codes
   - Check for collisions before saving

## Development Guidelines

### URL Shortening Flow

1. User submits original URL
2. Validate URL format and safety
3. Generate unique short code
4. Store in database with Prisma
5. Return shortened URL to user

### Redirection Flow

1. User visits `/{shortCode}`
2. Look up short code in database
3. Check if link is active and not expired
4. Record click asynchronously
5. Return 301/302 redirect to original URL
6. Handle 404 for invalid codes

### Performance Optimization

- Use database indexes on `shortCode` column (Prisma: `@@index`)
- Leverage Vercel Edge Functions for faster redirects if needed
- Use `unstable_cache` or React cache for frequently accessed links
- Batch insert click analytics with background jobs
- Vercel automatically handles CDN for static assets

## Deployment (Vercel)

### Build Configuration

- Framework Preset: Next.js (auto-detected)
- Build Command: `prisma generate && next build`
- Install Command: `npm install`

### Environment Variables

```env
# Database (use Vercel Postgres or external provider)
DATABASE_URL="postgresql://..."

# Auth (if using NextAuth)
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://your-domain.vercel.app"

# App
BASE_URL="https://your-domain.vercel.app"  # For generating short URLs
```

### Vercel-Specific Notes

- Use `vercel env pull` to sync environment variables locally
- Database connections: Use connection pooling (PgBouncer) for serverless
- Prisma: Add `directUrl` for migrations in serverless environments
- Preview deployments get unique URLs - handle BASE_URL accordingly
