# Caching rollout runbook

This release requires Clerk claims and the Redis v2 data migration to be ready
before production traffic is switched to the new code.

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

Backfill and verify existing users:

```bash
pnpm clerk:backfill-roblox
pnpm clerk:backfill-roblox --apply
```

Sign out and back in, or wait for Clerk's session token to refresh, then verify
that `roblox_id` and `roblox_username` are present.

## 2. Migrate Redis

The migration is dry-run by default:

```bash
pnpm redis:migrate-v2
pnpm redis:migrate-v2 --apply
```

Deploy only after the v2 hashes are populated. Keep legacy keys for the
24-hour rollback window, then remove them:

```bash
pnpm redis:migrate-v2 --apply --cleanup
```

The production identity reconciliation cron runs every six hours and should use
three Redis commands when mappings exist.

## 3. Deploy and validate

- Confirm dashboard routes render static or partial-prerendered shells.
- Confirm normal navigation makes no Clerk `currentUser()` Backend API call.
- Confirm FinSys, dashboard RSC, access, webhook, cron, and GenTag image
  responses do not appear in browser Cache Storage.
- Confirm inVote WebSocket and leaderboard SSE events update seeded SWR data.
- Monitor Upstash's seven-day projection. Alert at 400,000 projected commands
  per month and investigate before it reaches 500,000.
- Retain the prior deployment and legacy Redis keys for 24 hours.
