# webgoogleoauthtest

A minimal developer tool for testing Google OAuth flows. Sign in with Google and inspect the resulting JWT — raw token, decoded claims, and a ready-to-run `curl` command targeting your backend.

## Setup

```bash
cd web
cp .env.example .env
# Fill in .env with your values (see below)
pnpm install
pnpm dev
```

## Environment variables

Copy `web/.env.example` to `web/.env` and fill in:

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials |
| `VITE_API_URL` | Base URL of the backend API to test (no trailing slash) |

> `.env` is gitignored. Never commit real credentials.
