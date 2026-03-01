# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MYSverse Sentral is the official hub web app for MYSverse (a Malaysian-themed Roblox community). It provides game statistics, certificate management, a financial system, election data visualization, and live leaderboards. Deployed at `sentral.mysver.se`.

## Commands

```bash
pnpm dev              # Dev server on port 4300 (Turbopack)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm format           # Prettier (targets app, components, actions, utils, hooks, lib dirs)
pnpm generate         # Generate Prisma client (reads .env.local via dotenv)
pnpm migrate:dev      # Prisma dev migration (reads .env.local via dotenv)
pnpm migrate:deploy   # Deploy Prisma migrations
pnpm knip             # Detect unused exports/dependencies
```

No test framework is configured.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19, TypeScript 5.9
- **Styling:** Tailwind CSS v4 (via PostCSS), `clsx` for conditional classes
- **UI:** Headless UI v2, Radix UI, Heroicons, `sonner` for toasts
- **Animation:** `motion/react` + `motion-plus`
- **Auth:** Clerk (`@clerk/nextjs`) with custom Roblox OAuth provider
- **Database:** PostgreSQL (Supabase) via Prisma v7 with `@prisma/adapter-pg`
- **Cache:** Upstash Redis (`@upstash/redis`); local dev via `docker-compose.yml` (Redis + serverless-redis-http)
- **Client data:** SWR hooks (centralized in `components/swr.ts`)
- **Real-time:** SSE for leaderboards, WebSocket (`react-use-websocket`) for election data
- **URL state:** `nuqs` (`useQueryState`)
- **PDF:** `@react-pdf/renderer` + `react-pdf-tailwind` for certificates
- **PWA:** Serwist (`@serwist/next`), service worker at `app/sw.ts`
- **Analytics:** `next-plausible` (custom domain: `plausible.yan.gg`)
- **Validation:** Zod v4

## Architecture

### Path Aliases

TypeScript `baseUrl: "./"` — imports use bare paths: `"components/nav"`, `"lib/prisma"`, `"utils/sim"`, `"auth"`.

### Server vs Client Components

- Pages/layouts are Server Components by default
- Client components use `"use client"` directive
- Server-only modules pair `"use server"` with `import "server-only"`
- Server Components fetch data directly and pass props to client components

### Server Actions

Located in `actions/` and feature-specific `actions.ts` files. Use `"use server"` directive and `revalidatePath()` for cache invalidation. Follow the form-based pattern with `prevState` + `FormData`.

### API Routes

- User-facing routes: Clerk session authentication
- Machine-to-machine routes (certifier issuance, leaderboard): custom `X-API-KEY` header authentication

### Authorization

- Roblox group membership determines Sim feature access (FinSys, GenTag, Simetrics)
- `data/sim.ts` defines `allowedGroups` with group IDs and minimum rank thresholds
- Certifier admin access is hardcoded to specific Roblox user IDs

### Auth Helper

`auth.ts` wraps Clerk's `currentUser()` and extracts the linked Roblox account (`oauth_custom_roblox`), returning `{ user: { clerkId, id (robloxId), image, name } }`.

### Database

Prisma client output goes to `./generated/` (not default `node_modules`). Schema at `prisma/schema.prisma`. Models: Course, Batch, ApiKey, Certificate (with CertificateType enum), Leaderboard.

### SVG Handling

SVGs imported directly become React components (via `@svgr/webpack`). SVGs with `?url` suffix remain as URL strings.

### Feature Co-location

Page-specific components live alongside their `page.tsx` files (e.g., `dashboard/certifier/CoursesTable.tsx`).

## Code Style

- **Prettier:** double quotes, semicolons, no trailing commas, 80 char width, tailwindcss plugin
- **ESLint:** extends `next/core-web-vitals`, `next/typescript`, `prettier`; `@typescript-eslint/no-explicit-any` is off
- No barrel files — import specific file paths directly
- Fonts: Public Sans via `next/font/google` (defined in `styles/fonts.ts`)
