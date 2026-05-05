# LogSpanX Production Readiness And Performance Audit

Last reviewed: 2026-05-05

This document lists the changes required to make the current LogSpanX frontend production ready, easier to maintain, and more performant. It is based on a full repository scan plus `npm run lint` and `npm run build`.

## Current Verification Status

| Check | Status | Notes |
| --- | --- | --- |
| `npm run build` | Passing | Next.js 16.2.3 production build completes. |
| `npm run lint` | Failing | 67 errors and 72 warnings were reported. |
| Tests | Missing | No unit, integration, E2E, or visual test setup was found. |
| CI | Missing | No GitHub Actions or equivalent workflow was found. |
| Server-side route protection | Missing | Auth and RBAC are enforced only through client-side React effects. |
| Shared public report route | Missing | UI generates `/shared/{token}` links, but no matching app route exists. |

## Highest Priority Blockers

### 1. Fix The Lint Gate

Production should not ship while lint fails. Current high-error areas:

| File | Errors | Warnings |
| --- | ---: | ---: |
| `src/app/dashboard/reports/detailed/page.tsx` | 15 | 7 |
| `src/app/dashboard/team/page.tsx` | 11 | 6 |
| `src/app/dashboard/reports/weekly/page.tsx` | 8 | 4 |
| `src/app/dashboard/project-lead/page.tsx` | 6 | 0 |
| `src/app/dashboard/reports/summary/summary-bar-chart.tsx` | 5 | 0 |
| `src/components/tracker/bulk-edit-modal.tsx` | 4 | 1 |
| `src/components/layout/sidebar.tsx` | 3 | 12 |
| `src/app/dashboard/reports/summary/page.tsx` | 3 | 3 |

Required work:

- Replace `any` usage with typed API response and component prop shapes.
- Move inline component definitions out of render functions where React compiler rules flag `react-hooks/static-components`.
- Remove or use unused imports and variables.
- Fix unescaped text in JSX.
- Replace synchronous set-state-in-effect patterns where the lint rule reports cascading render risk.
- Keep `npm run lint` as a hard CI gate.

### 2. Fix Refresh Token Persistence

`login` and `signup` accept an `AuthPayload` containing `refreshToken`, but only `token`, `user`, and `authStatus` are written into state. Refresh logic later depends on `refreshToken`, so sessions can fail once the access token expires.

Affected file:

- `src/lib/stores/auth-store.ts`

Required work:

- Store `refreshToken` during login and signup.
- Add tests for login, signup, refresh success, refresh failure, and expired sessions.
- Confirm the backend refresh contract returns either `{ token, refreshToken }` or a documented equivalent.

Preferred production direction:

- Move tokens out of `localStorage`.
- Use HttpOnly, Secure, SameSite cookies where possible.
- If bearer tokens must remain in browser state, add explicit XSS hardening, content security policy, short access-token TTLs, and refresh-token rotation.

### 3. Add Server-Side Or Edge Route Protection

Dashboard access is currently enforced in `src/app/dashboard/layout.tsx` with client-side redirects. That prevents normal user navigation, but it is not a production security boundary.

Required work:

- Add `middleware.ts` or server-side route guards for protected dashboard routes.
- Validate the session before rendering protected routes.
- Move role checks for restricted route groups into a shared, server-safe module.
- Ensure unauthenticated requests to dashboard paths redirect before client JS runs.
- Ensure forbidden role access redirects or returns an authorization-safe response.

Suggested protected groups:

- `/dashboard/*`
- Role-restricted paths such as `/dashboard/projects`, `/dashboard/tags`, `/dashboard/project-lead`, `/dashboard/pm`, and `/dashboard/tl`.

### 4. Resolve RBAC Inconsistencies

RBAC helpers and route restrictions do not fully agree:

- `canManageProjects()` allows owner and admin.
- `/dashboard/projects` route access currently allows owner only.
- Sidebar hides Projects, Tags, and Project Lead for admin/member.

Required work:

- Define one canonical backend-to-frontend role model.
- Document exact permissions for `owner`, `admin`, and `member`.
- Align sidebar visibility, route guards, and UI action permissions with the same permission map.
- Add RBAC tests for every restricted path and important action.

Recommended structure:

```ts
const permissions = {
  owner: ['manage_users', 'manage_projects', 'manage_tags', 'delete_users'],
  admin: ['manage_users', 'manage_projects'],
  member: [],
}
```

Then derive route access and UI button visibility from this map.

### 5. Implement The Missing Shared Report Route

The shared reports UI copies links like:

```text
/shared/{token}
```

But there is no matching `src/app/shared/[token]/page.tsx` route. A production user receiving a shared link will hit a 404.

Required work:

- Add `src/app/shared/[token]/page.tsx`.
- Fetch public shared report data by token.
- Support loading, expired, revoked, and invalid-token states.
- Avoid requiring an authenticated dashboard session for public shared links unless the product explicitly requires it.
- Add E2E coverage for opening a copied shared report link.

### 6. Align Frontend API Paths With Backend Documentation

The frontend calls:

```text
GET /shared-reports
GET /shared-reports/{token}
```

The included API documentation says:

```text
GET /reports/shared?workspaceId=workspace_1
```

Required work:

- Confirm the real backend contract.
- Update either `API_DOCUMENTATION.md` or the frontend API calls.
- Add typed API wrappers for shared reports instead of making raw store calls.
- Add contract tests or mocked integration tests to prevent endpoint drift.

### 7. Harden The API Client

`src/lib/api/client.ts` currently parses every non-empty response body as JSON. That can crash on proxy HTML errors, plaintext backend errors, or malformed JSON.

Required work:

- Check `Content-Type` before JSON parsing.
- Catch `JSON.parse` failures and throw a controlled `ApiError`.
- Include response status, URL path, and safe error details.
- Add timeout or abort support.
- Add optional retry behavior only for safe idempotent GET requests.
- Avoid retrying mutation requests unless the backend supports idempotency keys.

Recommended behavior:

- 401: attempt refresh once, then clear session.
- 403: preserve session but show forbidden state.
- 404: return domain-specific not-found state.
- 409/422: expose validation errors to forms.
- 5xx/network: show retryable error UI without destroying local auth state.

## Performance Improvements

### 1. Reduce Global Data Fetching At App Startup

`useDataStore.initialize()` fetches users, groups, clients, projects, tags, time entries, and project tasks immediately after auth. This makes every dashboard entry pay the cost of all product data, even if the current route only needs a subset.

Current behavior:

- Fetch `/users`
- Fetch `/groups`
- Fetch `/clients`
- Fetch `/projects`
- Fetch `/tags`
- Fetch `/time-entries`
- Fetch `/projects/{id}/tasks` for every project in batches

Required optimization:

- Split data loading by route.
- Load tracker data only on tracker routes.
- Load report data only inside report pages.
- Load team data only inside team/admin pages.
- Cache stable reference data such as clients, tags, users, and projects separately.
- Add stale times and background refresh behavior.

Suggested approach:

- Use route-level hooks or a query/cache library.
- Keep Zustand for UI state and lightweight shared state.
- Avoid a single monolithic data store that owns all server data.

### 2. Paginate And Filter Time Entries Server-Side

Reports and dashboards should not rely on loading all time entries into the browser.

Required work:

- Add server-side date-range filters to time-entry queries.
- Add pagination for detailed reports.
- Add aggregation endpoints for summary and weekly reports.
- Avoid client-side filtering for large datasets.
- Add indexes on backend fields such as `workspaceId`, `userId`, `projectId`, `startTime`, and `billable`.

Frontend requirements:

- Show loading skeletons for paginated tables.
- Preserve filters in URL query parameters.
- Debounce text filters.
- Avoid recalculating large arrays on every render.

### 3. Avoid Per-Project Task Fetch Waterfalls

`fetchProjectTasks()` calls `/projects/{id}/tasks` for each project with concurrency 5. This is better than fully sequential fetching, but still becomes expensive as project count grows.

Required work:

- Add a bulk backend endpoint such as `GET /tasks?projectIds=...`.
- Or return project task counts/details in the project response where appropriate.
- Cache task data per project and fetch lazily when a project detail view opens.

### 4. Improve Report Page State Management

The report pages currently contain significant local filtering, sorting, mutation, and rendering logic in large client components.

Required work:

- Extract typed filter models.
- Move API request construction into `src/lib/api/reports.ts`.
- Memoize expensive derived datasets with stable dependencies.
- Move reusable table, filter, and chart logic into focused components.
- Use virtualization for long detailed report tables.

### 5. Stabilize Component Definitions

ESLint reports inline component definitions inside render functions, for example in `sidebar.tsx` and `bulk-edit-modal.tsx`. Besides failing lint, this can reset component state and hurt render performance.

Required work:

- Move child components to module scope.
- Pass only explicit props.
- Use `useMemo` only where there is measurable derived-data cost.
- Avoid recreating large arrays and option objects inside hot render paths.

### 6. Use Next.js 16 Root Configuration Correctly

The build warns that Next inferred `C:\Users\Admin\package-lock.json` as the workspace root instead of the project root because multiple lockfiles exist.

Required work:

- Read and follow `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/turbopack.md`.
- Set `turbopack.root` in `next.config.ts` to the project directory.
- Or remove the unrelated parent `C:\Users\Admin\package-lock.json` if it is not needed.

Example direction:

```ts
import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
```

Confirm the exact supported syntax against the installed Next 16 docs before committing.

## Security Hardening

### 1. Replace Browser Token Storage

Current persistence uses `localStorage`, which exposes tokens to injected JavaScript.

Required work:

- Prefer HttpOnly cookies for refresh/session tokens.
- Use short-lived access tokens.
- Rotate refresh tokens.
- Add logout invalidation on the backend.
- Clear all client auth state on logout and refresh failure.

### 2. Add Security Headers

Add production headers in `next.config.ts` or platform config:

- `Content-Security-Policy`
- `X-Frame-Options` or CSP `frame-ancestors`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security` on HTTPS deployments

The CSP needs careful testing because this app uses Next fonts, client scripts, and possibly external APIs.

### 3. Validate Runtime Data

The handover already calls out runtime validation as a priority. The frontend currently trusts API payload shapes and then maps them.

Required work:

- Add Zod or an equivalent schema validator for API responses.
- Validate auth payloads, users, projects, time entries, reports, and shared report payloads.
- Fail gracefully with controlled error states.
- Keep TypeScript types derived from schemas where practical.

### 4. Review Destructive Actions

Some destructive actions use `confirm()` or immediate API calls from UI handlers.

Required work:

- Replace browser `confirm()` with accessible confirmation dialogs.
- Show backend errors in a consistent toast or inline error system.
- Add optimistic update rollback for failed mutations.
- Add audit logging requirements for deletes, role changes, and report sharing.

## Reliability And Error Handling

### 1. Add Error Boundaries

Required work:

- Add route-level `error.tsx` files for dashboard and public shared report routes.
- Add `not-found.tsx` where entity IDs can be invalid.
- Add empty, loading, error, and retry states for all data-heavy pages.

### 2. Make Store Initialization Recoverable

`useDataStore.initialize()` can get stuck with `isInitialized: false` when required startup requests fail. The dashboard layout waits for initialization, so failures can leave users on a loading screen.

Required work:

- Separate required data from optional data.
- Surface initialization errors in the UI.
- Add retry controls.
- Allow partially loaded routes when noncritical resources fail.

### 3. Improve Environment Configuration

Current API base behavior:

- Uses `NEXT_PUBLIC_API_BASE_URL` if set.
- Falls back to `window.location.origin` in the browser.
- Throws on the server if missing.

Required work:

- Document required environment variables in `.env.example`.
- Avoid silent same-origin fallback unless the deployment always proxies API requests.
- Validate env values at startup.
- Add separate development, staging, and production configuration guidance.

## Testing Requirements

### 1. Unit Tests

Add unit tests for:

- `src/lib/rbac.ts`
- `src/lib/api/client.ts`
- `src/lib/api/mappers.ts`
- `src/lib/utils.ts`
- Auth store login/signup/refresh/logout behavior
- Data store mapping and failure behavior

Recommended tools:

- Vitest for unit tests.
- React Testing Library for components.
- MSW for API mocks.

### 2. Integration Tests

Add integration tests for:

- Login flow
- Auth refresh flow
- Dashboard redirect by role
- Time entry create/update/delete
- Project archive/unarchive
- Team role change
- Report generation
- Shared report creation and viewing

### 3. E2E Tests

Add Playwright tests for:

- Unauthenticated user is redirected away from dashboard.
- Owner/admin/member each see only allowed navigation.
- Member cannot access restricted routes directly.
- Timer flow works from start to stop.
- Detailed report filters and bulk edit work.
- Shared report link opens outside the dashboard session.

### 4. CI Workflow

Minimum CI gates:

```text
npm ci
npm run lint
npm run build
npm test
npm run e2e
```

Also add:

- Dependency audit or SCA.
- TypeScript check if separated from build.
- Playwright browser installation cache.
- Artifact upload for failed E2E screenshots/videos.

## Maintainability Improvements

### 1. Split The Monolithic Data Store

`src/lib/stores/data-store.ts` owns too many concerns:

- Users
- Groups
- Clients
- Projects
- Tasks
- Tags
- Time entries
- Reports
- Dashboard stats

Required work:

- Split API access into typed modules under `src/lib/api`.
- Keep Zustand stores focused on UI/session state.
- Move server data caching to a query layer or route-specific hooks.
- Avoid stores importing each other where possible.

### 2. Normalize API Types

Current mappers handle many backend shape variations: `id`, `_id`, populated objects, plain IDs, nested envelopes. That makes the frontend resilient, but it also hides backend contract drift.

Required work:

- Decide canonical API response shapes.
- Remove unnecessary fallback handling once backend is stable.
- Keep compatibility adapters isolated in one place.
- Add contract tests for mapper edge cases.

### 3. Refresh Documentation

Current `README.md` is still the default Next.js starter text.

Required docs:

- Local setup
- Required Node/npm versions
- Environment variables
- Backend dependency and API base URL
- Scripts
- Testing
- Deployment
- Auth/session model
- Role and permission matrix
- Troubleshooting common build/runtime issues

## Suggested Execution Plan

### Phase 1: Release Blockers

1. Fix lint errors.
2. Fix refresh-token storage.
3. Add shared report route or stop generating public links.
4. Align shared report API endpoint.
5. Add server-side/edge auth protection.
6. Fix Next/Turbopack root warning.

### Phase 2: Safety And Observability

1. Add `.env.example` and environment validation.
2. Harden API client parsing and error behavior.
3. Add route error boundaries.
4. Replace `localStorage` token strategy or formally accept the risk with mitigations.
5. Add security headers.

### Phase 3: Performance

1. Split startup data fetching by route.
2. Add server-side pagination/filtering for time entries and reports.
3. Replace per-project task fetches with bulk or lazy task loading.
4. Virtualize large tables.
5. Extract heavy report logic into typed, memoized modules.

### Phase 4: Tests And CI

1. Add unit tests for RBAC, API client, mappers, stores.
2. Add integration tests with mocked backend.
3. Add Playwright E2E for critical user journeys.
4. Add CI gates for lint, build, tests, and E2E.

## Definition Of Production Ready

The app should be considered production ready only when:

- `npm run lint` passes with no errors.
- `npm run build` passes with no warnings that affect deployment correctness.
- Auth refresh works and is covered by tests.
- Protected routes are enforced before client-side rendering.
- Role permissions are consistent across backend, route guards, sidebar, and UI actions.
- Shared report links work end to end.
- API contracts are documented and tested.
- Large data views are paginated or virtualized.
- Critical user journeys have E2E coverage.
- CI blocks merges that fail lint, build, tests, or E2E.
- Production environment variables and deployment steps are documented.
