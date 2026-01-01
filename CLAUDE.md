# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Urlitrim is a URL shortening service built with Next.js. It allows users to create shortened URLs, track click analytics, and manage their links.

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

## Design System

### Theme
- **Style**: Dark tech / Glassmorphism
- **Base background**: `bg-zinc-950` with `bg-grid` overlay
- **Accent gradient**: Blue → Cyan (`from-blue-500 to-cyan-500`)
- **Mode**: Dark mode only (`<html className="dark">`)

### Color Palette

| Purpose | Colors |
|---------|--------|
| Background | `zinc-950`, `zinc-900` |
| Text primary | `white` |
| Text secondary | `zinc-400`, `zinc-500` |
| Text muted | `zinc-600` |
| Accent | `blue-500`, `cyan-500`, `teal-500` |
| Success | `green-500` |
| Error | `red-500` |
| Borders | `white/10`, `white/5` |

### Component Patterns

**Cards (Glass effect)**
```tsx
<div className="glass rounded-2xl p-8 shadow-2xl">
// glass = bg-white/5 backdrop-blur-xl border border-white/10
```

**Buttons (Primary)**
```tsx
<button className="h-14 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-[0.98]">
```

**Buttons (Secondary)**
```tsx
<button className="h-12 px-6 rounded-xl font-medium text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all duration-300">
```

**Inputs**
```tsx
<input className="w-full h-14 px-5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300" />
```

**Gradient Text**
```tsx
<span className="text-gradient-brand">  // Blue → Cyan → Teal
<span className="text-gradient">        // White → Zinc
```

### Layout Patterns

**Full page centered**
```tsx
<div className="relative min-h-screen overflow-hidden bg-zinc-950">
  <div className="absolute inset-0 bg-grid" />
  <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
    {/* content */}
  </div>
</div>
```

**Ambient glow effect**
```tsx
<div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]" />
```

### Spacing & Sizing

| Element | Size |
|---------|------|
| Card padding | `p-8` |
| Card max-width | `max-w-xl` |
| Page max-width | `max-w-6xl` |
| Mobile padding | `px-4` |
| Button height | `h-12`, `h-14` |
| Input height | `h-14` |
| Border radius | `rounded-xl` (12px), `rounded-2xl` (16px) |
| Gap | `gap-3`, `gap-4`, `gap-8` |

### Animation & Transitions

- Default transition: `transition-all duration-300`
- Button press: `active:scale-[0.98]`
- Hover glow: `hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]`
- Loading spinner: `animate-spin`
- Status indicator: `animate-pulse`

### Custom CSS Classes (globals.css)

| Class | Effect |
|-------|--------|
| `bg-grid` | Grid line background pattern |
| `bg-dots` | Dot pattern background |
| `glass` | Glassmorphism effect |
| `text-gradient` | White to zinc gradient text |
| `text-gradient-brand` | Blue to cyan gradient text |
| `glow` | Multi-layer blue glow |
| `glow-sm` | Subtle blue glow |
| `animate-pulse-glow` | Pulsing glow animation |

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
