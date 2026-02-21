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

**Status:** Not Started

**Sub Tasks:**
- [ ] Improve mobile UX (filter drawer, task cards)
- [ ] Polish filter and sort controls
- [ ] Add validation and error messaging
- [ ] Performance review on main task queries
- [ ] Production readiness checklist

---

### Phase 4: Future Ready Hooks
**Description:** Groundwork for shared lists and AI extension points.

**Status:** Not Started

**Sub Tasks:**
- [ ] Wire TaskListMember model into permission abstraction
- [ ] Add hidden/minimal shared list support groundwork
- [ ] Plan and document AI extension points

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
- Shared lists: Post-PoC (Phase 4 handles groundwork)
- AI features: Future roadmap, not in PoC scope

### Dependencies and Requirements
- TaskListMember model and permission system must be in place
- Clean service layer around tasks for AI context feeding
- Authorization checks reusable by AI endpoints

---

## Current Project State

### Technology Stack
- **Framework:** Next.js 16.1.6 (App Router)
- **UI:** React 19.2.3, Tailwind CSS 4, Base UI + Radix UI
- **Package Manager:** Bun
- **Components Available:** button, input, card, badge, select, combobox, dropdown-menu, alert-dialog, textarea, field, label, separator, input-group

### What's Built
- Basic Next.js scaffold
- shadcn/ui component library configured
- Global styles with CSS variables

### What's Missing
- Prisma/PostgreSQL
- NextAuth/Auth.js
- tRPC
- Database models
- Domain logic
- UI screens (login, lists, tasks)
- Recurrence system
