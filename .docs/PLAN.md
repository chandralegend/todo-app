## 1. Executive Summary

Build a self hosted and cloud deployable Todo web application as a monolithic Next.js app with structured tasks, recurrence, SQL persistence, and simple authentication.

Primary goal of PoC is to validate:

* daily usability on desktop and mobile
* correctness of recurring task generation using task instances
* maintainable domain model that supports future shared lists
* smooth deployment workflow using Vercel and PostgreSQL

## 2. Final Decisions We Have Made

### Product decisions

1. Multi user capable foundation, but shared lists are future scope
2. Recurring tasks create new task instances for each occurrence
3. No reminders or notifications in PoC
4. Online only
5. Free text tags
6. Web app first, mobile and tablet via responsive UI

### Architecture decisions

1. Monolithic fullstack app with Next.js (App Router)
2. PostgreSQL as the main database
3. Prisma for schema and migrations
4. tRPC for typed backend operations
5. NextAuth or Auth.js credentials based auth
6. Vercel deployment target
7. Scheduled recurrence generation using Vercel Cron (idempotent job)
8. Future AI features planned via Vercel AI SDK integration points

### Current Boilerplate Stack

- **Next.js:** 16.1.6 (App Router)
- **UI:** Tailwind CSS 4, Base UI + Radix UI, shadcn patterns
- **Package Manager:** Bun
- **Fonts:** Outfit (headings), Geist (body/mono)

### Important design decisions

1. Use Task Template plus Task Instance model for recurrence
2. Store snapshots on task instances to preserve history
3. Keep shared list support in data model now, even if UI is not built yet
4. Use idempotent recurrence generation with DB constraints to prevent duplicates

## 3. Product Goal and Scope

### PoC goal

A reliable structured todo app for individual users, built in a way that supports future collaboration and AI enhancements.

### In scope for PoC

* Authentication and session based access
* List creation and task organization
* Structured task CRUD
* Recurrence configuration and automated instance generation
* Status lifecycle tracking
* Free text tags
* Filtering and sorting
* Responsive web UI
* Vercel deployment
* PostgreSQL persistence
* Migration based schema management

### Out of scope for PoC

* Shared lists UI and permissions management screens
* Notifications, push, email, SMS
* Offline sync and PWA offline mode
* Attachments
* Calendar sync
* AI features
* Advanced analytics and reporting
* Fine grained audit log
* Enterprise auth (SSO, OAuth providers)

## 4. Personas

## Persona 1: List Owner (Primary)

A professional user managing work and personal tasks with structure.

### Goals

* capture tasks quickly
* prioritize by importance and deadlines
* handle recurring tasks without manual re entry
* track progress with clear statuses
* use on desktop and mobile

### Pain points

* simple todo apps are too shallow
* many apps are too cluttered
* recurrence is often inflexible
* history becomes messy when recurring tasks mutate the same record

## Persona 2: Mobile Executor (Secondary behavior mode)

Same person in a different context, using phone during the day.

### Goals

* quick status updates
* quick task creation
* see what is due today or overdue

### Pain points

* desktop style UIs break on mobile
* too many taps to update status
* forms are painful on small screens

## Persona 3: Future Contributor (Future ready persona)

A user who gets access to a shared list later.

### Goals

* view shared tasks
* update assigned tasks
* collaborate without owning the list

### Why this matters now

The data model should support list membership later to avoid rework.

## Persona 4: Operator (Self host / deployment maintainer)

The person who deploys and maintains the app, likely you.

### Goals

* straightforward deploy
* safe migrations
* simple backups
* low operational overhead

## 5. High Level User Stories

## Epic A: Authentication

1. As a user, I can sign in with email or username and password so only I can access my tasks.
2. As a user, I stay signed in across sessions on my devices.
3. As a user, I can sign out from my session.

## Epic B: Task Lists

1. As a user, I can create task lists to separate work, personal, and other contexts.
2. As a user, I can rename and archive lists.
3. As a user, I can view tasks within a selected list.

Future ready
4. As a list owner, I can share a list with another user and control access.

## Epic C: Structured Task Management

1. As a user, I can create a task with created date, description, deadline, importance, repeat settings, tags, and status.
2. As a user, I can save a task as Draft and refine it later.
3. As a user, I can edit any task fields.
4. As a user, I can delete a task.

## Epic D: Task Lifecycle

1. As a user, I can move tasks through Draft, Todo, In Progress, Completed, and Failed.
2. As a user, I can change status quickly from the task list view.
3. As a user, completion and failure timestamps are recorded automatically.

## Epic E: Recurring Tasks

1. As a user, I can mark a task template as recurring.
2. As a user, I can define interval and time of day for recurring generation.
3. As a user, recurring tasks generate new task instances for each occurrence.
4. As a user, past occurrences remain preserved even if template details change.
5. As a user, I can disable a recurring template.

## Epic F: Filtering and Focus

1. As a user, I can filter by status, tags, importance, and due state.
2. As a user, I can view Today, Overdue, Active, and Completed quickly.
3. As a user, I can sort by deadline and importance.

## Epic G: Deployment and Reliability

1. As an operator, I can deploy the app with a repeatable process.
2. As an operator, DB schema changes are applied using migrations.
3. As an operator, recurring job runs safely without creating duplicate tasks.

## 6. Product Behavior and Rules

## Task status enum

* Draft
* Todo
* In Progress
* Completed
* Failed

## Suggested status transitions

Keep it permissive for PoC.

* Draft to Todo
* Todo to In Progress
* Todo to Completed
* Todo to Failed
* In Progress to Completed
* In Progress to Failed
* Failed to Todo
* Completed to Todo (optional reopen)

## Importance model

Keep simple.

Option A, enum:

* Low
* Medium
* High
* Critical

Option B, numeric scale:

* 1 to 5

Recommendation for PoC:

* Use enum for clarity in UI
* If future analytics matter, numeric can be added later

## Tags model

* Free text tags
* Normalized formatting rule recommended (trim, lowercase for storage or a canonical column)
* Keep user input display friendly, but use canonical values for filtering consistency

## Recurrence behavior

Recurring tasks are defined as templates. Actionable items are instances generated by scheduler.

### Important rule

Template edits affect future instances only.
Past instances remain unchanged via snapshot fields.

## 7. Domain Model and Schema Plan

This is the key part. It is not code level, but it is detailed enough for implementation.

## Core entities

### 7.1 User

Purpose: authenticated app user.

Fields

* id
* email (unique)
* username (optional, unique if used)
* password_hash
* display_name (optional)
* timezone (default Asia/Colombo, user editable later)
* is_active
* created_at
* updated_at

Notes

* NextAuth credentials flow can use email and password.
* Timezone should exist from day one for recurrence correctness later.

### 7.2 TaskList

Purpose: logical container for tasks.

Fields

* id
* owner_user_id
* name
* description (nullable)
* is_archived
* created_at
* updated_at

Notes

* Every task template and task instance belongs to a list.

### 7.3 TaskListMember (future ready, minimal now)

Purpose: shared list support later.

Fields

* id
* task_list_id
* user_id
* role (owner, editor, viewer)
* created_at
* updated_at

Notes

* For PoC, only owner membership may exist.
* Keep this now so future sharing does not require schema redesign.

### 7.4 TaskTemplate

Purpose: source definition of one off or recurring tasks.

Fields

* id
* task_list_id
* created_by_user_id
* description
* default_deadline_time (nullable)
* importance
* is_recurring (boolean)
* is_active (boolean)
* tags (free text array or join table, see tags note below)
* template_status (optional if you want Draft for templates)
* recurrence_rule_id (nullable)
* created_at
* updated_at

Notes

* One off tasks can still be represented as templates with one generated instance or direct instance creation. Choose one consistent approach.
* Recommended for consistency: all tasks originate from a template, recurring or non recurring.

### 7.5 RecurrenceRule

Purpose: recurrence configuration for templates.

Fields

* id
* frequency (daily, weekly, monthly, custom interval)
* interval_value (integer, for every N units)
* time_of_day (nullable)
* start_date
* end_date (nullable)
* timezone
* days_of_week (nullable for weekly support, array)
* next_generation_cursor (nullable, optimization)
* created_at
* updated_at

PoC support recommendation

* Daily every N days
* Weekly every N weeks on one weekday
* Optional second step: weekly multiple weekdays

Avoid in PoC

* complex RRULE parsing
* exceptions and holiday skipping
* last weekday of month type patterns

### 7.6 TaskInstance

Purpose: actual actionable occurrence.

Fields

* id
* task_template_id
* task_list_id
* occurrence_date (date key)
* scheduled_for (datetime nullable)
* deadline_at (datetime nullable)
* description_snapshot
* importance_snapshot
* tags_snapshot
* status
* started_at (nullable)
* completed_at (nullable)
* failed_at (nullable)
* created_at
* updated_at
* completed_by_user_id (nullable)
* failed_by_user_id (nullable)

Critical constraints

* unique(task_template_id, occurrence_date)
* indexes on task_list_id, status, deadline_at
* indexes for filtering by overdue and active states

Why snapshot fields are required
They preserve what the user actually worked on, even if the template changes later.

## Tags storage decision

For PoC, choose one of these and keep it simple.

Option A, PostgreSQL text array on template and instance snapshots

* fastest path
* simpler schema
* enough for PoC

Option B, normalized tags and join tables

* better analytics and tag management later
* more complexity now

Recommendation

* Use text array for template tags and instance tag snapshots in PoC
* If future tag governance is needed, migrate later

## 8. Recurrence Generation Design

This is the most important correctness area.

## Goal

Generate recurring task instances safely and predictably without duplicates.

## Execution model

Use Vercel Cron to trigger a protected server endpoint or server function that runs recurrence generation.

## Core principles

1. Idempotent generation
2. DB uniqueness prevents duplicates
3. Rolling window generation
4. Backfill small past window in case cron missed a run

## Recommended generation window

On each cron run:

* backfill previous 2 days
* generate next 14 days

This covers missed cron runs and keeps future tasks visible.

## High level flow

1. Load active recurring templates
2. For each template, compute occurrence dates within window
3. For each occurrence, attempt create instance with snapshots
4. Ignore duplicates using unique constraint conflict handling
5. Log counts per run

## Why this design

* works with serverless scheduled execution
* safe if cron triggers more than once
* no dependency on users opening the app
* preserves history

## 9. Architecture Plan

## 9.1 Overall architecture

Single Next.js codebase with app UI, tRPC APIs, auth, and recurrence scheduler entrypoint.

Components

* Next.js App Router UI
* tRPC router layer for app operations
* NextAuth for authentication
* Prisma for database access
* PostgreSQL database
* Vercel Cron for scheduled recurrence generation
* Future AI modules via Vercel AI SDK
* Tailwind CSS 4 + Base UI/Radix UI for components
* shadcn patterns for component structure

## 9.2 Runtime decisions

### Important

Use Node runtime for core backend routes that use Prisma and auth sessions.
Do not optimize for edge runtime in PoC.

Reason

* Prisma and auth integrations are simpler and more reliable in Node runtime
* Edge can be introduced later for selective paths if needed

## 9.3 Architectural style

Modular monolith.

Even though it is one app, keep domain modules clean:

* accounts
* lists
* tasks
* recurrence
* permissions
* shared utilities

This avoids route handler spaghetti.

## 10. Suggested App Modules and Ownership Boundaries

## 10.1 Accounts module

Responsibilities

* user model access
* auth session helpers
* current user context
* permission checks entry points

## 10.2 Lists module

Responsibilities

* create, rename, archive lists
* list ownership checks
* future membership checks

## 10.3 Tasks module

Responsibilities

* task template CRUD
* one off and recurring template handling
* task instance queries
* status transitions
* tags and filters

## 10.4 Recurrence module

Responsibilities

* recurrence rule validation
* occurrence computation
* instance generation job
* scheduler run logging (optional but recommended)

## 10.5 Permissions module

Responsibilities

* owner access checks now
* future list membership roles
* reusable guards for tRPC procedures

## 11. API Strategy with tRPC

You asked for tRPC and that is a good fit here.

## Why tRPC here

* strong typing across frontend and backend
* less boilerplate than REST for internal app
* great fit for a monolith
* fast iteration during PoC

## Pattern recommendation

Use tRPC as the main app interface for:

* queries for lists and tasks
* mutations for create, edit, status changes
* filtering and pagination inputs
* recurrence template management

Keep a few regular routes for:

* auth callbacks and NextAuth
* health endpoint
* cron trigger endpoint (if not using direct internal server call pattern)

## Example tRPC router groups (high level only)

* auth / session helpers (optional)
* lists
* taskTemplates
* taskInstances
* recurrenceAdmin (protected, internal only)

## Validation

Use Zod schemas for all tRPC inputs.
This is important for predictable behavior and easier UI error handling.

## 12. Authentication and Authorization Plan

## Auth choice

Use NextAuth / Auth.js with credentials provider for email plus password.

## Why this fits PoC

* simple login
* session management handled
* easy integration with Next.js
* enough security for personal or small team PoC if implemented correctly

## Authorization strategy for PoC

Owner only access to lists and tasks.

Rule

* every list operation verifies current user owns the list
* every task operation verifies task belongs to a list user can access

Future ready

* switch from owner only checks to membership based checks using TaskListMember table

## Security basics to include

* hashed passwords
* secure cookies in production
* CSRF safe patterns through NextAuth and app setup
* protected cron endpoint using secret token
* rate limiting on auth routes if feasible
* server side authorization checks, never UI only

## 13. UI and UX Plan (PoC)

## Available UI Components

The project has shadcn/ui patterns configured with the following components:
- button, input, card, badge
- select, combobox
- dropdown-menu, alert-dialog
- textarea, field, label
- separator, input-group

Tailwind CSS 4 is configured. CSS variables are used for theming.

## UI goals

* clean and fast
* mobile friendly
* minimal taps for status updates
* straightforward forms for structured tasks

## Core screens

### 13.1 Login screen

* email and password
* sign in
* simple error messages

### 13.2 Lists screen

* list of task lists
* create list
* archive list action
* default landing page after login

### 13.3 Task list view (per list)

Main productivity screen.

Features

* quick filters: Today, Overdue, Active, Completed
* filter controls: status, importance, tag
* sort controls: deadline, importance, created date
* quick status change from row/card
* add task button

Mobile behavior

* filter drawer collapsible
* task cards instead of dense tables
* primary actions one tap

### 13.4 Create and Edit Task screen or modal

Fields

* description
* deadline
* importance
* tags
* status
* repeating toggle
* recurrence settings (if repeating)
* save as Draft or Todo

### 13.5 Task detail panel or page

* full metadata
* instance history link from template (optional in PoC)
* status change controls
* delete action

### 13.6 Recurring template management view

Can be combined with create/edit task form in PoC.

## UX priorities for PoC

1. speed of capture
2. speed of status update
3. clarity of due and overdue tasks
4. mobile usability

## 14. Filtering and Querying Plan

## Required filters

* by status
* by importance
* by tag
* by due state (today, overdue, upcoming)
* by list

## Required sorting

* deadline ascending
* importance descending
* created date descending

## Query strategy

Implement task instance focused queries for day to day views.
Templates are configuration objects, instances are execution objects.

This keeps UI aligned with what users actually do.

## 15. Deployment Plan with Vercel

## Target setup

* Next.js app deployed on Vercel
* PostgreSQL hosted on Vercel compatible provider
* Scheduled recurrence via Vercel Cron
* Environment variables managed in Vercel project settings

## Important deployment decision

Use Node runtime for backend routes and tRPC handlers.

## Cron strategy on Vercel

Use a scheduled endpoint for recurrence generation with:

* secret protected access
* idempotent execution
* short bounded processing window
* logging for each run

If task volume grows later, move recurrence generation to a separate worker platform. For PoC this is not necessary.

## Environments

At minimum:

* local
* preview
* production

### Local

* Next.js local dev
* Docker PostgreSQL
* local env vars

### Preview

* optional preview db branch or isolated db schema
* useful for testing UI changes

### Production

* main db
* cron enabled
* secure env vars

## 16. Local Development and Self Hosting Plan

Even though Vercel is the primary deployment target, preserve local and self host capability.

## Local development

* Docker for PostgreSQL
* Next.js app runs locally
* Prisma migrations and seed scripts

## Optional self hosted path later

* Docker Compose with app plus Postgres
* reverse proxy if exposed to internet
* same Prisma migrations
* same recurrence scheduler concept, but cron can run externally

This gives you portability and avoids platform lock in.

## 17. Data Migration and Schema Change Strategy

## Rule

Use Prisma migrations from day one, even for PoC.

## Recommended practice

* one migration per meaningful schema change
* never hand edit production schema without migration
* seed scripts for initial test users and sample data
* migration tested in preview before production rollout

## 18. Testing Strategy (PoC level, not overkill)

## Must have tests

1. Recurrence generation correctness
2. Idempotency of recurrence generation
3. Status transition behavior
4. Authorization checks for list and task access
5. Core tRPC procedures validation behavior

## Nice to have

* UI smoke tests for main flows
* mobile layout checks
* cron endpoint auth test

## Most important test cases

* repeated cron runs do not create duplicate instances
* editing template does not alter past instances
* overdue filters work with timezone expectations
* owner cannot access another user list

## 19. Milestone Plan

## Phase 0: Foundation

Deliverables

* Next.js project scaffold
* Prisma and PostgreSQL connected
* NextAuth credentials login
* base layout and route protection
* Vercel deployment pipeline baseline
* local env setup documentation

## Phase 1: Lists and One Off Tasks

Deliverables

* TaskList CRUD
* TaskTemplate and TaskInstance base models
* one off task creation flow
* task list screen with filters and status update
* responsive UI baseline

## Phase 2: Recurrence

Deliverables

* RecurrenceRule model
* recurring template create/edit support
* occurrence computation logic
* cron triggered generation endpoint
* idempotent instance generation
* duplicate prevention via unique constraint
* logs and admin visibility

## Phase 3: Polishing and Hardening

Deliverables

* better mobile UX
* filter and sort polish
* validation and error messaging improvements
* performance review on main task queries
* production readiness checklist

## Phase 4: Future Ready Hooks (no major feature expansion)

Deliverables

* TaskListMember model wired into permission abstraction
* hidden or minimal groundwork for shared list support
* AI extension points planned and documented

## 20. Future AI Roadmap Hooks (Vercel AI SDK ready)

You explicitly want to leave room for AI features later. Good move.

## Keep these extension points now

1. clean service layer around tasks and recurrence
2. task and list query methods that can feed AI context
3. clear authorization checks reusable by AI endpoints
4. metadata fields or notes fields if needed later (optional)

## Potential AI features later

* smart task breakdown from a long task description
* auto tagging suggestions
* due date suggestions from natural language
* weekly review summary
* prioritization assistance
* recurrence pattern suggestion
* natural language task entry

## AI implementation guidance for later

Use Vercel AI SDK in isolated modules and keep AI outputs advisory, not direct DB writes without validation.

## 21. Risks and Guardrails

## Main risks

1. Recurrence duplication bugs
2. Mixing UI concerns and domain logic inside tRPC procedures
3. Overusing edge runtime too early with Prisma
4. Authorization gaps during future shared list rollout
5. Timezone issues in recurring generation

## Guardrails

1. unique constraint on template plus occurrence_date
2. idempotent recurrence job
3. Node runtime for backend operations
4. centralized permission checks
5. store timezone explicitly on user and recurrence rule
6. snapshot fields on task instances

## 22. Acceptance Criteria for the PoC

The PoC is successful when:

1. A user can sign in and manage their own lists and tasks.
2. A user can create structured tasks with status, deadlines, importance, and free text tags.
3. A user can create recurring templates and see generated task instances.
4. Running the scheduler repeatedly does not create duplicates.
5. The UI is usable on desktop and mobile browsers.
6. Data persists in PostgreSQL and survives redeploys.
7. App can be deployed on Vercel with environment based configuration.

---

# 23. Current Technology Stack (Boilerplate)

This section documents the technology stack currently in place after initial scaffolding.

## Core Framework
- **Next.js:** 16.1.6 (App Router)
- **React:** 19.2.3
- **Package Manager:** Bun

## UI Layer
- **Tailwind CSS:** v4 (with @tailwindcss/postcss)
- **Component Library:** Base UI (@base-ui/react) + Radix UI (radix-ui)
- **shadcn:** v3.8.5 (for component patterns)
- **Icons:** lucide-react
- **Animations:** tw-animate-css
- **Utilities:** class-variance-authority, clsx, tailwind-merge

## Fonts Configured
- **Outfit:** Sans-serif (primary, via CSS variable --font-sans)
- **Geist:** Sans and Mono (secondary)

## Current Components Available
- button, input, card, badge
- select, combobox
- dropdown-menu, alert-dialog
- textarea, field, label
- separator, input-group

---

# 24. UI Design Plan

## 24.1 Design System

### Color Palette
Will use CSS variables for theming. Base on default shadcn/ui patterns with potential customizations:
- Primary: Slate/Neutral based
- Accent: For CTAs and highlights
- Status colors:
  - Draft: Gray
  - Todo: Blue
  - In Progress: Amber/Orange
  - Completed: Green
  - Failed: Red
- Importance colors:
  - Low: Gray
  - Medium: Blue
  - High: Orange
  - Critical: Red

### Typography
- **Headings:** Outfit (via --font-sans variable)
- **Body:** Geist Sans
- **Code/Mono:** Geist Mono

### Spacing
- Use Tailwind's default spacing scale
- Mobile-first breakpoints
- Consistent padding: 4px, 8px, 12px, 16px, 24px, 32px

## 24.2 Screen Layouts

### Login Screen
- Centered card layout
- Email/password fields
- Sign in button
- Error message display area

### Lists Screen (Dashboard)
- Header with app title and user menu
- Grid or list of task lists
- Create list button
- Each list card shows: name, task count, quick actions
- Archive action in dropdown menu

### Task List View (Per List)
- Header: List name, filter/sort controls
- Quick filters: Today, Overdue, Active, Completed (pill buttons)
- Filter drawer (collapsible on mobile): status, importance, tags
- Sort dropdown: deadline, importance, created date
- Task cards in vertical list
- Each task card shows: checkbox, description, deadline, importance badge, tags
- Quick status change via checkbox or dropdown
- Floating action button (FAB) for mobile to add task
- Desktop: Add task button in header

### Task Create/Edit
- Modal or dedicated page
- Form fields:
  - Description (textarea)
  - Deadline (date picker)
  - Importance (select dropdown)
  - Tags (combobox with free text)
  - Status (select dropdown)
  - Repeating toggle
  - Recurrence settings (if repeating): frequency, interval, time, days
- Save as Draft or Save buttons

### Task Detail Panel
- Slide-over panel from right
- Full metadata display
- Status change controls
- Edit and delete actions

## 24.3 Mobile Considerations

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Patterns
- Filter drawer: Full-screen overlay, close button
- Task cards: Larger touch targets (min 44px)
- Status changes: Tap to cycle or long-press menu
- FAB: Bottom-right for quick add
- Swipe actions on task cards (optional enhancement)

## 24.4 Component Mapping

| Feature | Component(s) to Use |
|---------|---------------------|
| Buttons | button.tsx |
| Inputs | input.tsx, textarea.tsx |
| Forms | field.tsx, label.tsx |
| Dropdowns | select.tsx, dropdown-menu.tsx |
| Tags | badge.tsx, combobox.tsx |
| Task Cards | card.tsx with custom layout |
| Dialogs | dialog.tsx for task create/edit |
| Confirmations | alert-dialog.tsx |
| Task Detail Panel | sheet.tsx (slide-over) |
| Mobile Filters | drawer.tsx |
| Date Picker | calendar.tsx, date-picker.tsx |
| Quick Status Toggle | checkbox.tsx, toggle.tsx |
| Quick Filters | toggle-group.tsx |
| User Avatar | avatar.tsx |
| Loading States | skeleton.tsx |
| Notifications | toast.tsx, sonner.tsx |
| Hints | tooltip.tsx |
| Desktop Task Table | table.tsx |
| View Tabs | tabs.tsx |
| Empty States | empty.tsx |
| Lists | custom with separator.tsx |
| Status indicators | badge.tsx with color variants |
| Progress | progress.tsx |
| Keyboard shortcuts | kbd.tsx |

## 24.5 Implementation Notes

1. Use CSS variables in globals.css for theming
2. Build reusable layouts in app/ directory
3. Create domain-specific components in components/ directory
4. Keep UI components in components/ui/
5. Use tRPC for data fetching with React Query patterns
6. Implement optimistic updates for better UX

---

## 24.6 Additional Components to Install

Based on shadcn/ui library, install these additional components as needed:

| Component | Purpose |
|-----------|---------|
| dialog.tsx | Modal dialogs for task create/edit |
| sheet.tsx | Slide-over panels (task detail) |
| drawer.tsx | Mobile filter drawer |
| calendar.tsx | Date picker for deadlines |
| date-picker.tsx | Combined date picker |
| checkbox.tsx | Quick status toggle on tasks |
| toggle.tsx | Quick filter toggles |
| avatar.tsx | User avatar in header |
| popover.tsx | Dropdown positioning |
| progress.tsx | Task completion progress |
| skeleton.tsx | Loading states |
| toast.tsx / sonner.tsx | Notifications |
| tooltip.tsx | Helpful hints |
| table.tsx | Desktop task list view |
| tabs.tsx | View switching (list/all/completed) |
| resizable.tsx | Panel resizing |
| navigation-menu.tsx | Main navigation |
| scroll-area.tsx | Scrollable containers |
| empty.tsx | Empty state displays |
| hover-card.tsx | Quick preview on hover |
| kbd.tsx | Keyboard shortcuts display |

---

## 24.7 ASCII Wireframes

### Login Screen
```
┌─────────────────────────────────────────┐
│                                         │
│              ┌───────────────┐          │
│              │   📝 Todo App  │          │
│              └───────────────┘          │
│                                         │
│         ┌─────────────────────┐         │
│         │  Email              │         │
│         └─────────────────────┘         │
│         ┌─────────────────────┐         │
│         │  Password           │         │
│         └─────────────────────┘         │
│                                         │
│         ┌─────────────────────┐         │
│         │      Sign In         │         │
│         └─────────────────────┘         │
│                                         │
│         ┌─────────────────────┐         │
│         │  Create Account     │         │
│         └─────────────────────┘         │
│                                         │
└─────────────────────────────────────────┘
```

### Lists Screen (Dashboard)
```
┌──────────────────────────────────────────────────────────┐
│  📝 TodoApp                        [Avatar ▼]            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  My Lists                          [+ New List]          │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📋 Work Tasks                            12 tasks   │ │
│  │    3 overdue                                    ⋮   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📋 Personal                          8 tasks     │ │
│  │    1 overdue                                    ⋮   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📋 Shopping                               5 tasks │ │
│  │                                              ⋮   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│                      [+ Create List]                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Task List View (Main Screen)
```
┌─────────────────────────────────────────────────────────────┐
│  ← Work Tasks                          [Filter ▼] [Sort ▼] │
├─────────────────────────────────────────────────────────────┤
│  [All] [Today] [Overdue] [Active] [Done]                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ☐ Review PR #234                                     │ │
│  │    📅 Tomorrow  ●High  #code  #urgent                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ☑ Write documentation                        ✓ DONE │ │
│  │    📅 Feb 20  ●Medium  #docs                     2d   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ☐ Fix login bug                                       │ │
│  │    📅 Today  ⚠ OVERDUE  ●Critical  #bug   #urgent    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ⟳ Weekly team meeting (recurring)           ▶        │ │
│  │    📅 Every Monday 10:00  ●Medium  #meeting           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│                                     [+ Add Task]           │
└─────────────────────────────────────────────────────────────┘
```

### Task Create/Edit Modal
```
┌─────────────────────────────────────────────────────────────┐
│  ✕                                                         │
│                                                             │
│  Add Task                                          [Save]  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Description *                                        │ │
│  │                                                       │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Deadline                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ Feb 21, 2026        │  │ 10:00 AM            │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
│  Importance                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ○ Low  ● Medium  ○ High  ○ Critical                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Status                                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Draft  ● Todo  ○ In Progress  ○ Completed           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Tags                                                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ work [x]  personal [x]  + add tag                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  ⟳  Repeat                                                 │
│                                                             │
│  Frequency:  ┌────────────────────────────────┐  ▼        │
│              │ Daily                          │            │
│              └────────────────────────────────┘            │
│                                                             │
│  Every:     ┌──┐  days                                        │
│                                                             │
│  Time:      ┌────────────────────┐                           │
│              │ 10:00 AM           │                           │
│              └────────────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Task View
```
┌─────────────────────┐
│  ← Work Tasks    ⋮  │
├─────────────────────┤
│ [All][Today][Overdue]│
│ [Active]  [Done]    │
├─────────────────────┤
│                     │
│ ┌─────────────────┐ │
│ │ ☐ Task one      │ │
│ │    📅 Tomorrow  │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ ☐ Task two      │ │
│ │    📅 Today     │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ ☐ Task three    │ │
│ │    📅 Overdue   │ │
│ └─────────────────┘ │
│                     │
│              [+]   │
└─────────────────────┘
```

### Task Detail Panel (Sheet)
```
┌─────────────────────────────────┐
│  Task Details           ✕      │
├─────────────────────────────────┤
│                                 │
│  Review PR #234                 │
│                                 │
│  Status:  [In Progress    ▼]    │
│                                 │
│  ─────────────────────────     │
│                                 │
│  Deadline:  Feb 22, 2026       │
│              10:00 AM          │
│                                 │
│  Importance:  ● High           │
│                                 │
│  Tags:  #code  #urgent         │
│                                 │
│  ─────────────────────────     │
│                                 │
│  Created:  Feb 15, 2026        │
│  Updated:  Feb 20, 2026        │
│                                 │
│  ─────────────────────────     │
│                                 │
│  Recurring:  Daily              │
│  Next:  Feb 22, 2026           │
│                                 │
│  ─────────────────────────     │
│                                 │
│  [      Edit Task      ]       │
│                                 │
│  [    Delete Task     ]       │
│                                 │
└─────────────────────────────────┘
```

### Filter Drawer (Mobile)
```
┌─────────────────────────────────┐
│  ✕  Filters           [Clear]  │
├─────────────────────────────────┤
│                                 │
│  Status                         │
│  ┌─────────────────────────┐    │
│  │ □ Draft                 │    │
│  │ ☑ Todo                  │    │
│  │ □ In Progress           │    │
│  │ □ Completed             │    │
│  │ □ Failed                 │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────     │
│                                 │
│  Importance                     │
│  ┌─────────────────────────┐    │
│  │ □ Low                   │    │
│  │ ☑ Medium               │    │
│  │ □ High                  │    │
│  │ □ Critical              │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────     │
│                                 │
│  Tags                           │
│  ┌─────────────────────────┐    │
│  │ #work [x]               │    │
│  │ #personal [x]           │    │
│  │ #urgent                 │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────     │
│                                 │
│  Due Date                       │
│  ┌─────────────────────────┐    │
│  │ Today                   │    │
│  │ This Week               │    │
│  │ Overdue                 │    │
│  │ Custom Range            │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │     Apply Filters       │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

### Empty States
```
Lists Empty:
┌─────────────────────────────────────────┐
│                                         │
│           📋 No lists yet              │
│                                         │
│    Create your first list to get        │
│           started!                     │
│                                         │
│         ┌───────────────────┐           │
│         │  Create List     │           │
│         └───────────────────┘           │
│                                         │
└─────────────────────────────────────────┘

Tasks Empty:
┌─────────────────────────────────────────┐
│                                         │
│         ✓ No tasks yet                 │
│                                         │
│      Add a task to get started!        │
│                                         │
│         ┌───────────────────┐           │
│         │   Add Task       │           │
│         └───────────────────┘           │
│                                         │
└─────────────────────────────────────────┘

No Results (Filtered):
┌─────────────────────────────────────────┐
│                                         │
│         🔍 No tasks found              │
│                                         │
│    No tasks match your filters.        │
│       Try adjusting them.              │
│                                         │
│         [Clear Filters]                │
│                                         │
└─────────────────────────────────────────┘
```

### User Menu Dropdown
```
┌─────────────────────────┐
│ 👤 John Doe            │
│    john@example.com    │
├─────────────────────────┤
│ ⚙️  Settings           │
│ 📊  Statistics         │
├─────────────────────────┤
│ 🚪  Sign Out           │
└─────────────────────────┘
```

## 24.8 Component State Patterns

### Button States
- Default: Primary action visible
- Hover: Slight elevation/shadow
- Active: Pressed effect
- Disabled: 50% opacity, no pointer events
- Loading: Spinner icon, disabled state

### Task Card States
- Default: White background
- Hover: Subtle shadow, border highlight
- Selected: Blue border
- Overdue: Red left border accent
- Completed: Muted text, strikethrough optional

### Form Field States
- Default: Gray border
- Focus: Blue border, ring
- Error: Red border, error message below
- Disabled: Gray background

### Status Badge Colors
- Draft: Gray (#6b7280)
- Todo: Blue (#3b82f6)
- In Progress: Amber (#f59e0b)
- Completed: Green (#10b981)
- Failed: Red (#ef4444)

### Importance Badge Colors
- Low: Gray (#6b7280)
- Medium: Blue (#3b82f6)
- High: Orange (#f97316)
- Critical: Red (#dc2626)

