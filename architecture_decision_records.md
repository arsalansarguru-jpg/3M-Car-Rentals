# RentalOS Architecture Decision Records (ADRs)
**The Constitutional Architectural & Governance Document of the Rental Operating System**

---

## Part 1: Architecture Decision Records

---

### ADR 001: Adoption of Next.js App Router

* **Status**: Accepted
* **Date**: 2026-07-14
* **Owner**: Principal Platform Architect
* **Decision Drivers**: 
  * Low-latency page delivery.
  * Server-side data loading.
  * Unified routing conventions.
* **Context**: The platform requires a modern React framework to support both high-performance public landing pages and secure administrative dashboards.
* **Decision**: Adopt Next.js App Router (v16+) utilizing filesystem-based layout layouts.
* **Alternatives Considered**: Vite SPA with React Router (discarded due to lack of server-rendering and SEO capabilities out-of-the-box).
* **Consequences**:
  * *Benefits*: Automatic route division, optimized performance, unified server/client routing.
  * *Drawbacks*: Requires distinct conventions for `"use client"` vs Server Components.
* **Risks**: Learning curve for incoming junior developers on App Router boundaries.
* **Implementation Notes**: Standard routing gates are enforced at edge middleware levels.
* **Future Review Trigger**: Revisit if Node/Next deployment performance targets exceed SLA limits.
* **Related Documents**: [engineering_playbook.md](file:///c:/Users/DELL/Desktop/3MCarRentals/engineering_playbook.md)

---

### ADR 002: Adoption of Supabase as Primary BaaS Provider

* **Status**: Accepted
* **Date**: 2026-07-14
* **Owner**: Lead Database Architect
* **Decision Drivers**:
  * Realtime updates.
  * Pre-configured PostgreSQL database instances.
  * Integrated email/password and OAuth signups.
* **Context**: We need to accelerate initial platform delivery without losing the capability to write custom PostgreSQL DDL schemas.
* **Decision**: Use Supabase for real-time subscription hubs, file bucket storage, and Auth gateways.
* **Alternatives Considered**: Self-hosted PostgreSQL on AWS RDS + Firebase Auth (discarded due to operational overhead).
* **Consequences**:
  * *Benefits*: Native PostgreSQL features, instant REST APIs, and managed RLS.
  * *Drawbacks*: Potential vendor lock-in on Supabase hooks.
* **Risks**: Network latency between Next.js server hosts and Supabase endpoints.
* **Implementation Notes**: Server components must resolve keys via server-only clients.
* **Future Review Trigger**: Revisit when data growth exceeds 50 million audit/telemetry records.
* **Related Documents**: [database_optimization_plan.md](file:///c:/Users/DELL/Desktop/3MCarRentals/database_optimization_plan.md)

---

### ADR 003: Core Adoption of React Server Components (RSC)

* **Status**: Accepted
* **Date**: 2026-07-14
* **Owner**: Senior Frontend Engineer
* **Decision Drivers**:
  * Reduced client bundle sizes.
  * Direct server-to-database connections.
  * Elimination of client-side `useEffect` data fetching loops.
* **Context**: The admin dashboard needs to fetch large telemetry tables without bogging down the browser.
* **Decision**: All primary pages are Server Components by default; interactive widgets are isolated into client-side leaf components.
* **Alternatives Considered**: Client-side single-page applications with REST queries.
* **Consequences**:
  * *Benefits*: Zero-JS bundle overhead for table displays, direct server queries.
  * *Drawbacks*: Client context cannot be passed to Server Components.
* **Risks**: Unintentional importing of client modules on server boundaries.
* **Implementation Notes**: Mark client components explicitly with `"use client"`.
* **Future Review Trigger**: Revisit if client rendering pipelines show bottlenecks.
* **Related Documents**: [design_system_documentation.md](file:///c:/Users/DELL/Desktop/3MCarRentals/design_system_documentation.md)

---

### ADR 004: Type-Safe Asynchronous Domain Event Bus

* **Status**: Accepted
* **Date**: 2026-07-14
* **Owner**: Staff Backend Engineer
* **Decision Drivers**:
  * Core modules decoupling.
  * Thread execution non-blocking.
  * Simplified event tracking.
* **Context**: Direct database mutations in bookings were causing immediate email triggers, slowing page responses.
* **Decision**: Implement an in-memory `DomainEventDispatcher` event bus executing subscriber callbacks concurrently.
* **Alternatives Considered**: Apache Kafka or RabbitMQ broker queues (discarded due to cost and deployment complexity at this stage).
* **Consequences**:
  * *Benefits*: Fast mutations, type-safe payload checks, clean decoupling.
  * *Drawbacks*: In-memory bus does not survive process crashes.
* **Risks**: Message loss if the Node execution thread terminates during processing.
* **Implementation Notes**: Events must inherit from the base `DomainEvent` interface.
* **Future Review Trigger**: Revisit when transitioning to multi-instance microservices.
* **Related Documents**: [domain_event_architecture.md](file:///c:/Users/DELL/Desktop/3MCarRentals/domain_event_architecture.md)

---

### ADR 005: Soft Deletes Persistence Strategy

* **Status**: Accepted
* **Date**: 2026-07-14
* **Owner**: Lead Database Architect
* **Decision Drivers**:
  * Regulatory audit requirements.
  * Prevention of cascading deletions.
  * Simplified restoration workflows.
* **Context**: Accidental vehicle deletions were breaking historical booking records.
* **Decision**: Implement `deleted_at` timestamps across vehicles and users, and filter selects using RLS rules.
* **Alternatives Considered**: Archive tables or hard deletions (discarded due to schema sync overhead).
* **Consequences**:
  * *Benefits*: Secure data retention, instant data restoration.
  * *Drawbacks*: Increased database indexes size.
* **Risks**: Developers forgetting to filter out deleted entries on raw SQL selects.
* **Implementation Notes**: Use default RLS queries to omit `deleted_at IS NOT NULL` records.
* **Future Review Trigger**: Revisit when total row volume in deleted records exceeds active records.
* **Related Documents**: [database_optimization_plan.md](file:///c:/Users/DELL/Desktop/3MCarRentals/database_optimization_plan.md)

---

### ADR 006: Granular Enterprise RBAC Schema

* **Status**: Accepted
* **Date**: 2026-07-14
* **Owner**: Security Architect
* **Decision Drivers**:
  * Branch and manager separation of controls.
  * Strict database access restrictions.
  * UI buttons authorization guards.
* **Context**: The platform needs to support ten operational roles ranging from Cleaner to CEO.
* **Decision**: Adopt a permission-based mapping scheme utilizing `roles`, `permissions`, and `role_permissions` join tables.
* **Alternatives Considered**: Role checking using simple string comparisons (e.g. `role === 'admin'`).
* **Consequences**:
  * *Benefits*: Extremely granular permission settings.
  * *Drawbacks*: Database query overhead.
* **Risks**: Complex permission graphs.
* **Implementation Notes**: Enforce gates using `rbac.can(role, permission)`.
* **Future Review Trigger**: Revisit when adding tenant-specific custom permission overrides.
* **Related Documents**: [enterprise_rbac_matrix.md](file:///c:/Users/DELL/Desktop/3MCarRentals/enterprise_rbac_matrix.md)

---

### ADR 007: Unified Design System Strategy

* **Status**: Accepted
* **Date**: 2026-07-14
* **Owner**: Senior Frontend Engineer
* **Decision Drivers**:
  * Layout style consistency.
  * Component reusability.
  * Standardized visual layout.
* **Context**: Developers were writing custom, duplicate cards and modals across different dashboards.
* **Decision**: Enforce standard components (`<Card>`, `<Table>`, `<Drawer>`, `<Dialog>`) under `src/components/ui`.
* **Alternatives Considered**: Third-party component libraries (e.g. Tailwind UI, Shadcn).
* **Consequences**:
  * *Benefits*: Full aesthetic control, theme consistency.
  * *Drawbacks*: Frontend team must build and maintain the primitives.
* **Risks**: Component complexity creep.
* **Implementation Notes**: Prohibit inline custom wrappers for table filters.
* **Future Review Trigger**: Revisit if the design system begins limiting custom visual layouts.
* **Related Documents**: [design_system_documentation.md](file:///c:/Users/DELL/Desktop/3MCarRentals/design_system_documentation.md)

---

### ADR 008: Schema Validation with Zod

* **Status**: Accepted
* **Date**: 2026-07-14
* **Owner**: Staff Backend Engineer
* **Decision Drivers**:
  * Prevent malformed inputs.
  * Type safety.
  * Descriptive client validation messages.
* **Context**: Hand-written request parameters checks in API routes led to unhandled type errors.
* **Decision**: Implement Zod validation schemas for all incoming HTTP payloads.
* **Alternatives Considered**: Joi validation schemas (discarded due to poor TypeScript inference).
* **Consequences**:
  * *Benefits*: Native types inference, standardized validation wrapper responses.
  * *Drawbacks*: Slight performance overhead on parsing complex nested graphs.
* **Risks**: Validation rules drift between DB constraints and Zod definitions.
* **Implementation Notes**: Invoke `validateBody(schema, req)` in API controllers.
* **Future Review Trigger**: Revisit if validator execution latency exceeds 15ms.
* **Related Documents**: [api_standard_documentation.md](file:///c:/Users/DELL/Desktop/3MCarRentals/api_standard_documentation.md)

---

### ADR 009: Centralized Database Audit Logging

* **Status**: Accepted
* **Date**: 2026-07-14
* **Owner**: Lead Database Architect
* **Decision Drivers**:
  * Financial verification requirements.
  * Security logs.
  * Operational troubleshooting.
* **Context**: Storing audits inside JSON fields in metadata columns made query scans difficult.
* **Decision**: Implement a dedicated `audit_logs` table tracking user, action, entity, entity_id, oldValue, and newValue.
* **Alternatives Considered**: Storing logs inside file text logs (discarded due to SQL query difficulty).
* **Consequences**:
  * *Benefits*: Clear operational trail, fast history query logs.
  * *Drawbacks*: Rapid database growth.
* **Risks**: Performance hits if not indexed.
* **Implementation Notes**: Write logs via `AuditService.logAudit()`.
* **Future Review Trigger**: Revisit when table reaches 10 million rows to partition logs.
* **Related Documents**: [audit_standard_documentation.md](file:///c:/Users/DELL/Desktop/3MCarRentals/audit_standard_documentation.md)

---

### ADR 010: Centralized Notification Service Architecture

* **Status**: Accepted
* **Date**: 2026-07-14
* **Owner**: Staff Backend Engineer
* **Decision Drivers**:
  * Message formatting abstraction.
  * Decoupled queues.
  * Retry and dead-letter pipelines.
* **Context**: Modules were importing custom SMS and email clients directly, causing code duplication and missing failover handlers.
* **Decision**: Centralize all communication channels inside `NotificationService` triggered by domain events.
* **Alternatives Considered**: Third-party SaaS notification handlers (discarded due to cost and vendor lock-in).
* **Consequences**:
  * *Benefits*: Single interface, queue throttling, retry handling.
  * *Drawbacks*: Simulating channels requires local mocks.
* **Risks**: Database queue locks under heavy peak loads.
* **Implementation Notes**: Call `NotificationService.publishEvent()` asynchronously.
* **Future Review Trigger**: Revisit before launching multi-branch operations.
* **Related Documents**: [notification_standard_documentation.md](file:///c:/Users/DELL/Desktop/3MCarRentals/notification_standard_documentation.md)

---

## Part 2: RentalOS Maturity Roadmap (Level 1 to 5)

| Level | Name | Primary Goal | Exit Criteria | Success Metrics |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Application** | Build a single-company rental platform | Core booking, fleet, finance modules functional | Odometer triggers working; online checkouts active |
| **2** | **Platform** | Establish shared services & reusable architecture | centralize Workflow, Rules, Notifications, and Audits | 100% of workflows routed through Core services |
| **3** | **Business OS** | Launch complete operational ERP | Maintenance, inspection checklists, compliance tracking live | Downtime decreased by 50%; 0 compliance fines |
| **4** | **Industry Platform**| Build ecosystem integrations | Payments, telematics, Tally, messaging, and partner portals | API integration latency < 150ms |
| **5** | **Multi-Tenant SaaS**| Launch enterprise SaaS platform | Tenant isolation, custom branding, subscription billing | 100% tenant separation; automated provisioning |

---

## Part 3: Architecture Governance & Review Cadence

To ensure ADRs remain living documents, the platform steering committee will implement:
1. **Regular Cadence**: Review all accepted ADRs every 6–12 months.
2. **Expansion Triggers**: Re-evaluate decisions before introducing multi-tenancy (SaaS) or switching database/cloud providers.
3. **Change Management**: Any significant change to core services must begin with a new ADR proposal before code implementation.
