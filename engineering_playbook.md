# 3M Car Rentals Engineering Playbook
**Official Engineering Playbook & Development Standards for 100+ Engineer Teams**

*Prepared by: Office of the VP of Engineering*

---

## 1. Architectural Core Principles

Every module, route, or service added to the 3M Car Rentals platform must align with these architectural principles:

* **Decoupled Service Boundary (SRP)**: Services must have a single responsibility. Business logic (such as calculating payments or cleaning thresholds) must be contained within services, rather than in page routes or React components.
* **Asynchronous Domain Events**: Services communicate asynchronously by publishing events to the `DomainEventDispatcher` event bus. Do not import or call secondary services directly inside target services.
* **Serverless-First Operations**: Heavy processes (such as reminders, expiries checks, and deposit releases) must run as decoupled background jobs managed by the `Background Worker` queue.
* **Gated Server Gating**: Authentication and role access checks must execute at the Next.js Server Layout level before rendering client presentation trees.

---

## 2. Directory & Folder Standards

```
src/
├── app/               # App Router pages and API routes
│   ├── admin/         # Gated administrative routes
│   └── api/           # Next.js Server API endpoint routes
├── components/        # Presentational elements
│   └── ui/            # Reusable Design System components library
├── services/          # Server-only domain service classes
├── utils/             # Helper libraries and schemas
├── lib/               # Database setups, schemas, and engines
├── styles/            # Global styling sheets and tokens
└── types/             # Common TypeScript interfaces
```

### Folder Rules
* **No Inline Pages Logic**: Place Client Presenter code in `<RouteName>-client.tsx` next to the main `page.tsx` file instead of cluttering the page routing index.
* **File Sizing Caps**: React files must not exceed 500 lines of code. Extract complex sections into modular sub-components.
* **Modular Boundaries**: Ensure sub-modules under `/admin/` are structured to support future transition into independent workspace packages.

---

## 3. Design System & Component Rules

All user interfaces must utilize the reusable UI components library located in `src/components/ui/` to maintain design consistency and support responsive layouts.

### UI Guidelines
* **Glassmorphism Rules**: Implement custom glassmorphism styles by using standard variables (e.g. `--color-bg-card`, `--radius-card`, `glass-card`).
* **Design System Components**:
  * Utilize `<Card>` and `<KpiCard>` for metric displays.
  * Utilize `<Table>`, `<TableToolbar>`, and `<Pagination>` for list views.
  * Utilize `<Drawer>` and `<Modal>` for overlays.
  * Utilize `<Badge>` and `<StatusBadge>` for status labels.
* **Responsive Layouts**: Design layouts to be fully responsive across mobile (375px+), tablet (768px+), desktop (1024px+), and wall-mounted displays.
* **Accessibility (A11y)**:
  * Interactive elements must support full keyboard navigation (e.g. Esc key to close overlay panels).
  * Use proper screen reader properties (such as `aria-expanded`, `role="dialog"`, `aria-hidden`).

---

## 4. API & Database Standards

### API Rules
* **Method Consistency**: Match REST methods to CRUD operations (`GET` for reads, `POST` for creates, `PATCH` for updates, `DELETE` for deletes).
* **Structured Response Shapes**:
  * Success: `{ data, meta }`
  * Error: `{ error: { code, message, details } }`
* **Input Validation**: Use Zod schemas and standard wrappers (`validateBody()`, `validateQuery()`) to validate incoming payloads and return structured errors.

### Database Rules
* **Soft Deletes**: Key tables (`users`, `vehicles`, `bookings`) must support soft deletions via a `deleted_at` timestamp. All select queries must filter for `deleted_at IS NULL`.
* ** TDD Indexing**: Add indexes for foreign keys, search filters, and query ranges.
* **Table Partitioning**: High-growth audit tables (`audit_logs`, `notifications`) must use partitioning (e.g., PostgreSQL range partitioning on the `timestamp` column).

---

## 5. Security & Performance Standards

### Security Rules
* **Role-Based Access Control (RBAC)**: Map users to specific roles (CEO, Branch Manager, Fleet Manager, Operations Manager, Finance, Support, Inspector, Cleaner, Workshop, Driver). Check permissions before executing actions or rendering pages.
* **Next.js Edge Gating**: Gated routes (`/admin/*`, `/dashboard/*`) must use Next.js Edge Middleware for session verification.
* **Row-Level Security (RLS)**: Keep RLS enabled on all PostgreSQL tables. Use service-role tokens only inside secure API routes.

### Performance Rules
* **Query Caching**: Use Next.js fetch caching or Redis key-value caching for static datasets.
* **Lazy Loading**: Use dynamic imports (`next/dynamic`) to lazy-load heavy charts or slide-in drawers, reducing initial bundle sizes.
* **Polling Avoidance**: Do not use short polling for real-time dashboards. Use WebSocket channels (e.g. Supabase Realtime) instead.

---

## 6. Structured Logging Standards

Console logging is prohibited in production. All logs must use the `Logger` service:

* **`Logger.info(message, payload)`**: For standard operational confirmations.
* **`Logger.warn(message, payload)`**: For recoverable failures.
* **`Logger.error(message, error, payload)`**: For application crashes or failed database transactions.
* **`Logger.security(message, payload)`**: For recording authorization anomalies.
* **`Logger.audit(message, payload)`**: For recording user data mutations.
* **`Logger.performance(message, durationMs, payload)`**: For mapping action runtimes and slow database queries.

---

## 7. Testing & Git Standards

### Git Flow & PR Strategy
* **Branch Prefixes**: Always prefix branches (e.g. `feature/onboarding`, `bugfix/refunds`).
* **PR Gating**: Merging to `develop` requires:
  * Successful linting checks (`npm run lint`).
  * Successful TypeScript compilation (`npx tsc --noEmit`).
  * Green unit test coverage.
  * Successful review and approval from at least one reviewer.

---

## 8. Definition of Done (DoD)

A task is defined as **Done** only when it meets the following criteria:

* [ ] Code compiles without TypeScript errors or warnings.
* [ ] ESLint rules are satisfied.
* [ ] Custom reusable UI components are used for presentation.
* [ ] Database migration files (`.sql`) are included (if applicable).
* [ ] API endpoints return standardized JSON success/error envelopes.
* [ ] Validation is enforced on inputs using Zod.
* [ ] Service actions and data mutations log audit trails.
* [ ] Unit tests pass and coverage is maintained.
* [ ] Code is peer-reviewed and approved.

---

## 9. Production Readiness Checklist

Before pushing changes to the production environment, complete the following flight checks:

* [ ] Verify environment variables (`.env.production`) are set in the hosting provider.
* [ ] Run pending database migrations.
* [ ] Perform a database backup.
* [ ] Verify that RLS policies are active on new tables.
* [ ] Run smoke tests on staging and verify key user flows.
* [ ] Verify that error logs are piping to Sentry/Datadog.
* [ ] Confirm the rollback strategy is ready (tested deployment rollbacks and database `down` scripts).
