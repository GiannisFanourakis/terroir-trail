# Phase 11 Production Account & Community Smoke

This smoke test exercises the deployed TerroirTrail account and review stack against Firebase Hosting, the Cloud Run API rewrite, Firebase Auth and production Firestore rules.

## Safety model

Use **dedicated test accounts only**. The runner requires four distinct accounts:

1. Traveler A — ordinary Traveler, no Admin or producer ownership.
2. Traveler B — ordinary Traveler, no Admin or producer ownership.
3. Host — verified active owner of the producer supplied as `SMOKE_PRODUCER_ID`.
4. Admin — trusted TerroirTrail Admin with community-review moderation authority.

The runner never prints passwords or ID tokens. Traveler A's Favorites, Passport stamps and private notes are snapshotted before mutation and restored afterward. The smoke review is deleted after testing. If a run fails midway, the `finally` cleanup path attempts the same restoration and resolves any still-pending smoke review report before deleting the review.

A resolved review-report/audit record may remain by design because moderation history is append-only operational evidence. Reusing the same dedicated accounts and producer reuses the deterministic review/report identity rather than creating an unbounded number of records.

## Setup

After the current build is deployed, pull `main` and create a local smoke environment file:

```powershell
Copy-Item .env.smoke.example .env.smoke.local
notepad .env.smoke.local
```

Fill in the four dedicated account credentials and a producer ID owned by the Host account. Existing Firebase web-client values may remain in `.env.local`.

Both Traveler test accounts should sign into the normal app once before the first smoke run so their private `users/{uid}` profile documents exist.

## Run

```powershell
npm run smoke:production
```

The command exits non-zero on the first failed assertion or on incomplete cleanup.

## What it verifies

- production Hosting is reachable;
- all four role accounts can authenticate;
- server-derived capabilities keep Traveler, Host and Admin authority separate;
- the Host owns only the configured smoke producer for the tested path;
- Traveler A cannot read or write Traveler B's private profile;
- Favorites, Passport visited state and private notes survive sign-out/sign-in;
- Traveler B's private state is unchanged by Traveler A mutations;
- Verified Visit follows completed-booking evidence, not merely a Passport stamp;
- a Host cannot rate its own managed producer;
- a Traveler can create and edit one review per producer;
- public review responses do not expose Firebase traveler/host UIDs;
- a non-owner cannot publish an official Host reply;
- the verified Host can reply on its owned producer;
- a Traveler can report a review but cannot enter Admin moderation;
- the Admin can see the report, hide the review, resolve the pending report and restore the review;
- the Traveler can delete the review;
- reversible Traveler profile state is restored exactly after the smoke.

## Success output

A successful run ends with:

```text
PASS: Phase 11 production account/community smoke completed successfully.
All reversible profile/review mutations were restored or deleted.
```

Do not mark Phase 11 production-smoke items complete from the automated Quality Gate alone. This command must be run against the deployed production environment with the dedicated role accounts.
