# Project Progress

## Phased Plan with Each Phase's Tasks

### Phase 0: Foundation
**Description:** Set up the core infrastructure - database, authentication, and deployment baseline.

**Status:** Completed

**Sub Tasks:**
- [x] Initialize Prisma with PostgreSQL schema
- [x] Set up NextAuth/Auth.js with credentials provider
- [x] Create base layout with authentication state
- [x] Set up route protection (middleware)
- [x] Configure Vercel deployment pipeline
- [x] Create local env setup documentation

**Summary of what has been done so far:**
- Next.js project scaffolded with App Router
- Tailwind CSS configured
- shadcn/ui components set up (buttons, inputs, cards, badges, forms, dialogs, dropdowns, selects, comboboxes, etc.)
- Base fonts configured (Outfit, Geist)
- Prisma with PostgreSQL schema (User, TaskList, TaskListMember, TaskTemplate, RecurrenceRule, TaskInstance)
- NextAuth with credentials provider
- Login and register pages
- Route protection via middleware
- Docker Compose for local PostgreSQL
- Local setup documentation (.docs/LOCAL_SETUP.md)

**What is left to do:**
- Phase 1: Lists and One Off Tasks

**Notes:**
- Prisma 7.x requires @prisma/adapter-pg and pg driver
- Next.js 16.1.6, React 19.2.3
- Uses Base UI and Radix UI for components
- tRPC not yet installed

---

### Phase 1: Lists and One Off Tasks
**Description:** Core task management - TaskList CRUD, TaskTemplate/TaskInstance models, task list UI with filters.

**Status:** Completed

**Sub Tasks:**
- [x] Create TaskList CRUD operations
- [x] Implement TaskTemplate and TaskInstance Prisma models
- [x] Build task list screen (main productivity view)
- [ ] Add filtering controls (status, importance, tag, due state)
- [ ] Add sorting controls (deadline, importance, created date)
- [ ] Implement quick status change from task list
- [x] Add filtering controls (status, importance, tag, due state)
- [x] Add sorting controls (deadline, importance, created date)
- [x] Implement quick status change from task list
- [x] Build task create/edit form
- [x] Ensure responsive UI for mobile

**Notes:**
- Implemented list creation flow (`/lists/new`) and list detail view (`/lists/[id]`)
- Dashboard now lists user task lists with direct navigation
- Added one-off task creation flow (`/lists/[id]/tasks/new`) using TaskTemplate + TaskInstance write path
- Added list-level filtering (status, importance, due state, tag), sorting, and status quick-update actions
- Updated list task cards with responsive layout, badges, and tag display
- Will need tRPC for API layer
- UI should support quick capture and quick status updates per PLAN.md

---

### Phase 2: Recurrence
**Description:** Implement recurring tasks with idempotent instance generation.

**Status:** Completed

**Sub Tasks:**
- [x] Create RecurrenceRule Prisma model
- [x] Implement recurrence settings in task create/edit form
- [x] Build occurrence computation logic
- [x] Create cron-triggered generation endpoint
- [x] Implement idempotent instance generation
- [x] Add unique constraint to prevent duplicates
- [x] Add logs for admin visibility

**Notes:**
- Added recurrence engine at `lib/recurrence.ts` with daily/weekly/monthly/custom matching
- Added cron endpoint `GET/POST /api/cron/recurrence` with secret-token auth support
- Generation window defaults to backfill 2 days and forward 14 days
- Duplicate prevention uses `createMany({ skipDuplicates: true })` on top of unique constraint
- Added recurrence configuration inputs in task create flow (`/lists/[id]/tasks/new`)

**Notes:**
- Use Vercel Cron for scheduling
- Must be idempotent - repeat runs should not create duplicates

---

### Phase 3: Polishing and Hardening
**Description:** Mobile UX improvements, filter/sort polish, validation, production readiness.

**Status:** Completed

**Sub Tasks:**
- [x] Improve mobile UX (filter drawer, task cards)
- [x] Polish filter and sort controls
- [x] Add validation and error messaging
- [x] Performance review on main task queries
- [x] Production readiness checklist

**Notes:**
- Enforced status transition rules in `lib/task-status.ts` and list update actions
- Added recurrence run admin visibility page at `/admin/recurrence`
- Added recurrence run logging persistence via `RecurrenceRunLog`
- Added health endpoint at `/api/health` for deployment monitoring
- Added `vercel.json` cron schedule for recurrence endpoint
- Added composite indexes for list/status/importance/created task queries

---

### Phase 4: Future Ready Hooks
**Description:** Groundwork for shared lists and AI extension points.

**Status:** Completed

**Sub Tasks:**
- [x] Wire TaskListMember model into permission abstraction
- [x] Add hidden/minimal shared list support groundwork
- [x] Plan and document AI extension points

**Notes:**
- Added centralized list permission abstraction in `lib/permissions.ts` (read/write/manage + shared access query)
- Updated list dashboard and task routes to use permission checks for owner/member access
- Added hidden shared-list API groundwork at `app/api/lists/[id]/members/route.ts` (GET members, POST add/update member role)
- Added AI extension point helper at `lib/ai/task-context.ts` to build permission-safe task context snapshots

---

### Phase 5: UI/UX Redesign
**Description:** Full redesign of the application UI/UX with warm coral/terracotta accent, bento-grid layouts, sidebar navigation, and premium minimal modern aesthetic.

**Status:** In Progress

**Sub Tasks:**
- [x] Create `ui-redesign` branch
- [x] Update `.docs/PLAN.md` Section 25 with redesign wireframes (all screens)
- [x] Update `globals.css` with warm coral/terracotta color palette and custom tokens
- [x] Install 20 new shadcn components (sidebar, breadcrumb, sonner, sheet, avatar, skeleton, progress, tooltip, popover, dialog, scroll-area, toggle, toggle-group, collapsible, tabs, checkbox, table, drawer, hover-card)
- [x] Create layout components: AppShell, AppSidebar, TopBar, Footer, AppBreadcrumbs
- [x] Create UI primitives: BentoCard, BentoGrid, PillButton, FilterChip, CircularDate, ProgressRing, StatusBadge, ImportanceBadge, StatCard, EmptyState
- [x] Lint + build pass clean
- [ ] Redesign Dashboard page (bento grid, stat cards, list cards)
- [ ] Redesign Login/Register pages (centered card, coral accent)
- [ ] Redesign Task List View (sidebar layout, filter chips, circular dates)
- [ ] Redesign Task Create/Edit (sheet/dialog form)
- [ ] Redesign Admin/Recurrence page (stat cards + table)
- [ ] Mobile responsive pass for all pages
- [ ] Final polish, animations, empty states

**Summary of what has been done so far:**
- Branch `ui-redesign` created from `main`
- Full redesign plan with ASCII wireframes added to PLAN.md Section 25
- Color palette changed from purple/slate to warm coral/terracotta (#E86C4F)
- Custom CSS tokens: `--coral`, `--coral-hover`, `--coral-light`, `--coral-muted`
- Status and importance color tokens added to theme
- Custom CSS animations: bento-card hover, filter chip entrance, pill-arrow slide, circular-date styles
- 20 shadcn components installed (sidebar, breadcrumb, sonner, sheet, avatar, skeleton, progress, tooltip, popover, dialog, scroll-area, toggle, toggle-group, collapsible, tabs, checkbox, table, drawer, hover-card)
- 5 layout components created in `components/layout/` (AppShell, AppSidebar, TopBar, Footer, AppBreadcrumbs)
- 9 custom UI primitives created in `components/ui/` (BentoCard, BentoGrid, PillButton, FilterChip, FilterChipGroup, CircularDate, ProgressRing, StatusBadge, ImportanceBadge, StatCard, EmptyState)

**What is left to do:**
- Rewrite each page to use new layout and components (pending user approval)

**Notes:**
- All new components pass lint and build
- Layout components are standalone and can be incrementally adopted
- Existing pages remain unchanged until approved
- Sidebar uses shadcn SidebarProvider with cookie-persisted state
- Mobile sidebar renders as Sheet overlay

---

## Future Plans

### Description
After PoC is complete, the following features could be considered:

1. **Shared Lists** - Allow users to share lists with others (editors, viewers)
2. **AI Features** (Vercel AI SDK):
   - Smart task breakdown from long descriptions
   - Auto tagging suggestions
   - Due date suggestions from natural language
   - Weekly review summaries
   - Prioritization assistance
   - Recurrence pattern suggestions
   - Natural language task entry

### Timeline
- UI/UX Redesign: In progress (Phase 5)
- Shared lists: Post-redesign
- AI features: Future roadmap

### Dependencies and Requirements
- TaskListMember model and permission system must be in place
- Clean service layer around tasks for AI context feeding
- Authorization checks reusable by AI endpoints

---

## Current Project State

### Technology Stack
- **Framework:** Next.js 16.1.6 (App Router)
- **UI:** React 19.2.3, Tailwind CSS 4, Base UI + Radix UI, shadcn/ui (radix-nova style)
- **Package Manager:** npm (bun.lock legacy present)
- **Components Available:** alert-dialog, avatar, badge, breadcrumb, button, card, checkbox, collapsible, combobox, dialog, drawer, dropdown-menu, field, hover-card, input, input-group, label, popover, progress, scroll-area, select, separator, sheet, sidebar, skeleton, sonner, table, tabs, textarea, toggle, toggle-group, tooltip (32 total)

### Custom Layout Components
- `components/layout/app-shell.tsx` - Main authenticated shell with sidebar + topbar + footer
- `components/layout/app-sidebar.tsx` - Collapsible sidebar with nav, lists, admin, user sections
- `components/layout/top-bar.tsx` - Top bar with sidebar trigger, search, avatar dropdown
- `components/layout/footer.tsx` - Copyright and version footer
- `components/layout/breadcrumbs.tsx` - Route-aware breadcrumb trail

### Custom UI Primitives
- `components/ui/bento-card.tsx` - Ring-bordered card with hover effect for bento grids
- `components/ui/pill-button.tsx` - Rounded-full button with arrow icon
- `components/ui/filter-chip.tsx` - Dismissible filter tag
- `components/ui/circular-date.tsx` - Round date display (day + month)
- `components/ui/progress-ring.tsx` - Circular SVG progress indicator
- `components/ui/status-badge.tsx` - Color-coded task status badge
- `components/ui/importance-badge.tsx` - Color-coded importance indicator
- `components/ui/stat-card.tsx` - Summary metric card
- `components/ui/empty-state.tsx` - Empty state with icon, title, CTA
