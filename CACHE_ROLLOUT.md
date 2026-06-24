# Caching rollout runbook

Production Vercel builds now run the pending rollout steps automatically before
`next build`. A versioned Redis status hash makes the process idempotent and
resumable: completed steps are skipped on later deploys, and a short-lived
distributed lock prevents concurrent production builds from doing the same
work.

## 1. Configure Clerk

In Clerk Dashboard → Sessions → Customize session token, merge these compact
claims into the existing claim template:

```json
{
  "roblox_id": "{{user.public_metadata.roblox_id}}",
  "roblox_username": "{{user.public_metadata.roblox_username}}"
}
```

Keep the complete session token below Clerk's recommended size limit. Do not add
the complete public metadata or external-account objects.

Create a webhook pointing to `/api/webhooks/clerk`, subscribe to `user.created`
and `user.updated`, and set `CLERK_WEBHOOK_SIGNING_SECRET`.

The next production deployment backfills existing users automatically. These
commands remain available for inspection or an explicit manual run:

```bash
pnpm clerk:backfill-roblox
pnpm rollout:status
pnpm rollout:production
```

The navigation detects linked users with stale claims and calls Clerk's
`user.reload()` once, forcing a fresh session token without adding routine
Clerk Backend API calls to navigation.

## 2. Migrate Redis

The standalone migration remains dry-run by default:

```bash
pnpm redis:migrate-v2
pnpm rollout:production
```

The automated rollout retains legacy keys. After the new deployment has been
healthy for 24 hours, remove them explicitly:

```bash
pnpm redis:migrate-v2 --apply --cleanup
```

The production identity reconciliation cron runs every six hours and should use
three Redis commands when mappings exist.

Set `SKIP_PRODUCTION_ROLLOUTS=1` only as an emergency Vercel environment
override. Preview and local builds skip production rollout work automatically.

## 3. Deploy and validate

- Confirm dashboard routes render static or partial-prerendered shells.
- Confirm normal navigation makes no Clerk `currentUser()` Backend API call.
- Confirm FinSys, dashboard RSC, access, webhook, cron, and GenTag image
  responses do not appear in browser Cache Storage.
- Confirm inVote WebSocket and leaderboard SSE events update seeded SWR data.
- Monitor Upstash's seven-day projection. Alert at 400,000 projected commands
  per month and investigate before it reaches 500,000.
- Retain the prior deployment and legacy Redis keys for 24 hours.
