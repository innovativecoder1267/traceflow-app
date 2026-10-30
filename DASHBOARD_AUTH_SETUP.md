# Dashboard session authentication setup

This change adds a dashboard-only JWT session. It does not replace or modify the backend `accessToken` verification used by backend API routes.

## Required environment variables

Configure these in the **backend Vercel project**:

- `JWT_SECRET`: keep the existing backend JWT secret unchanged.
- `DASHBOARD_HANDOFF_SECRET`: a new high-entropy secret (at least 32 random bytes).

Configure these in the **dashboard Vercel project**:

- `BACKEND_URL`: backend origin only, for example `https://your-backend-project.vercel.app` (no trailing `/api`).
- `DASHBOARD_HANDOFF_SECRET`: exactly the same value configured in the backend project.
- `DASHBOARD_JWT_SECRET`: a different high-entropy secret (at least 32 random bytes).

Do not prefix any of these variables with `NEXT_PUBLIC_`. They are server-only secrets.

## Deployment order

1. Add the environment variables to both Vercel projects.
2. Deploy the backend changes first so login returns a one-time handoff and the redemption endpoint is available.
3. Deploy the dashboard changes.
4. Test login, refresh a protected dashboard URL, expiry/invalid-cookie redirect, backend API calls, and logout in a production-like environment.

The backend login continues setting its existing HttpOnly `accessToken` cookie. It additionally issues a 60-second, single-use handoff code. The dashboard server redeems that code with the backend, then signs its own three-day JWT and sets the HttpOnly `dashboardSession` cookie on the dashboard origin.

The handoff record is consumed atomically from MongoDB. Its TTL index is cleanup assistance; the redemption query independently checks expiry.
