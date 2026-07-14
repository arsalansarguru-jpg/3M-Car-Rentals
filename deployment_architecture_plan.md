# 3M Car Rentals Production Deployment Plan
**Enterprise CI/CD Pipelines, Git Branching Workflows, Database Migrations, & Release Checklists**

*Prepared by: Principal DevOps Architect & Engineering Manager*

---

## 1. Branch Strategy & Git Flow

To manage parallel feature development, hotfixes, and stable releases, the project will follow a Git Flow branching model:

```
  main  ────────────────────────── [Release Tag] ────────────────────
         ▲                                   ▲
  release ─── [QA Gated Run] ─────────────────
         ▲
  develop ─────────────────────────────────── [Merge PR] ────────────
         ▲                                     ▲
  feature ─── [Local Lints] ───────────────────
```

### Branch Classifications
* **`main`**: Represents the production state. Direct pushes are disabled. Code enters only via approved Pull Requests from the `release` or `hotfix` branches.
* **`develop`**: The primary integration branch. Features merge here after code review.
* **`feature/*`**: Short-lived branches created for specific tasks (e.g., `feature/onboarding-docs`).
* **`release/*`**: Created to prepare for a production release. Only bug fixes are permitted on this branch.
* **`hotfix/*`**: Created directly from `main` to address critical production issues. Merges back to both `main` and `develop`.

---

## 2. Pull Request (PR) Template Specification

A `.github/PULL_REQUEST_TEMPLATE.md` file will be added to standardize code submissions:

```markdown
## Summary
Provide a brief summary of the changes and the reasoning behind them.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Database migration (DDL changes included)
- [ ] Security/RBAC update

## QA & Testing Checklist
- [ ] Tested locally on Node 18/20
- [ ] Linting checks passed (`npm run lint`)
- [ ] Build compiled successfully (`npm run build`)
- [ ] E2E and Unit tests completed successfully

## Database Migrations
- [ ] No migrations required
- [ ] SQL migration script included under `/src/lib/`
- [ ] Verified rollback DDL script is included and tested
```

---

## 3. CI/CD Testing & Deployment Pipeline

The deployment process is automated using GitHub Actions workflows:

### Phase 1: Continuous Integration (Lints & Tests)
Triggers on any PR push to `develop` or `main`:
1. **Linter Validation**: Runs ESLint (`npm run lint`).
2. **TypeScript Compilation**: Ensures code compiles without TypeScript errors (`npx tsc --noEmit`).
3. **Unit & Integration Tests**: Runs tests to verify business logic.

### Phase 2: Preview Deployments (Staging)
On PR creation, the hosting provider (e.g., Vercel) provisions a isolated preview environment.
* **Database Isolation**: The preview environment connects to a dedicated staging database schema to protect production datasets.

### Phase 3: Production Deployment & Database Migrations
Triggers when a release branch merges into `main`:
1. **Database Migration Gating**: The migration runner executes pending SQL scripts in `/src/lib/` against the production database.
2. **Build Compilation**: The Next.js production build compiles.
3. **Atomic Cutover**: The load balancer updates the routing targets to the new build, ensuring zero-downtime deployment.

---

## 4. Rollback & Feature Flags Strategy

### Database & Build Rollbacks
* **Build Rollback**: In the event of a production issue, the hosting platform redirects traffic to the previous stable build, completing the rollback within seconds.
* **Database Rollback**: If a database migration fails or causes issues, the rollback script executes the migration's corresponding `down` DDL script.

### Feature Flags
We will use feature flags to decouple code deployments from feature releases:
* **Configuration**: Feature flags are managed via centralized configuration keys (e.g., LaunchDarkly or a custom environment variable config file).
* **Usage**:
  ```typescript
  import { isFeatureEnabled } from "@/utils/flags";

  if (isFeatureEnabled("enterprise-rbac")) {
    return <EnterpriseRBACConsole />;
  }
  ```

---

## 5. Production Release Checklist

Before marking a release as complete, the release manager must complete the following checklist:

### Pre-Deployment
1. [ ] Code freeze is active.
2. [ ] QA team has approved the release branch.
3. [ ] Database backup has completed successfully.
4. [ ] Production environment variables (`.env`) match the required release variables.

### Deployment & Verification
5. [ ] Migration scripts have executed successfully.
6. [ ] Next.js build has deployed and is active.
7. [ ] API healthcheck endpoints return status code `200`.
8. [ ] Verify auth cookie decodes and route guards block unauthorized access.

### Post-Deployment
9. [ ] Check error monitoring dashboards (e.g., Sentry) for spikes.
10. [ ] Close and merge the release branch.
