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
- Nothing - completed

**Notes:**
- Prisma 7.x requires @prisma/adapter-pg and pg driver
- Next.js 16.1.6, React 19.2.3
- Uses Base UI and Radix UI for components

---

### Phase 1: Lists and One Off Tasks
**Description:** Core task management - TaskList CRUD, TaskTemplate/TaskInstance models, task list UI with filters.

**Status:** Completed

**Sub Tasks:**
- [x] Create TaskList CRUD operations
- [x] Implement TaskTemplate and TaskInstance Prisma models
- [x] Build task list screen (main productivity view)
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
- Added health endpoint at `/api/health` for deployment monitoring

---

### Phase 4: Future Ready Hooks
**Description:** Groundwork for shared lists and AI extension points.

**Status:** Completed

**Sub Tasks:**
- [x] Wire TaskListMember model into permission abstraction
- [x] Add hidden/minimal shared list support groundwork
- [x] Plan and document AI extension points

**Notes:**
- Added centralized list permission abstraction in `lib/permissions.ts`
- Added hidden shared-list API groundwork at `app/api/lists/[id]/members/route.ts`
- Added AI extension point helper at `lib/ai/task-context.ts`

---

### Phase 5: UI/UX Redesign
**Description:** Full redesign of the application UI/UX with warm coral/terracotta accent, bento-grid layouts, sidebar navigation, and premium minimal modern aesthetic.

**Status:** Completed

**Sub Tasks:**
- [x] Create `ui-redesign` branch
- [x] Update `.docs/PLAN.md` Section 25 with redesign wireframes (all screens)
- [x] Update `globals.css` with warm coral/terracotta color palette and custom tokens
- [x] Install 20 new shadcn components (sidebar, breadcrumb, sonner, sheet, avatar, skeleton, progress, tooltip, popover, dialog, scroll-area, toggle, toggle-group, collapsible, tabs, checkbox, table, drawer, hover-card)
- [x] Create layout components: AppShell, AppSidebar, TopBar, Footer, AppBreadcrumbs
- [x] Create UI primitives: BentoCard, BentoGrid, PillButton, FilterChip, CircularDate, ProgressRing, StatusBadge, ImportanceBadge, StatCard, EmptyState
- [x] Create `/design` page as public component showcase
- [x] Add Docker support (Dockerfile, docker-compose app service)
- [x] Redesign Dashboard page (AppShell + bento grid + stat cards + list cards with progress rings)
- [x] Redesign Login/Register pages (centered card, coral pill buttons, branded header)
- [x] Redesign Task List View (filter pills, active filter chips, circular dates, status/importance badges, task cards)
- [x] Redesign Task Create (form inside BentoCard with AppShell sidebar, recurrence section)
- [x] Redesign Create List page (circle icon header, clean form)
- [x] Redesign Admin/Recurrence page (stat cards + data table with status indicators)
- [x] Mobile responsive pass for all pages
- [x] Lint + build pass clean

**Summary of what has been done:**
- Branch `ui-redesign` created from `main`
- Full redesign plan with ASCII wireframes added to PLAN.md Section 25
- Color palette: warm cream bg (#F5F3EF), coral accent (#E07A5F), thin #E5E2DC borders (no shadows)
- Custom CSS tokens: coral, coral-hover, coral-light, coral-muted, status colors, importance colors
- Custom CSS animations: bento-card hover, filter chip entrance, pill-arrow slide, circular-date styles
- 32 shadcn components installed total
- 5 layout components: AppShell, AppSidebar, TopBar, Footer, AppBreadcrumbs
- 9+ custom UI primitives: BentoCard, BentoGrid, PillButton, FilterChip, CircularDate, ProgressRing, StatusBadge, ImportanceBadge, StatCard, EmptyState
- All 7 app pages fully rewritten with new design system
- Extracted client components: DashboardContent, ListViewContent, NewTaskContent, NewListContent, RecurrenceContent

**Notes:**
- All pages pass lint and build clean
- Pre-existing LSP errors in `types/validator.ts`, `app/api/cron/recurrence/route.ts`, `app/admin/recurrence/page.tsx` (Prisma client type issues) are from main branch and don't affect build
- oklch colors don't work in this Tailwind v4 + shadcn setup -- all colors converted to hex
- Sidebar uses shadcn SidebarProvider with cookie-persisted state
- Mobile sidebar renders as Sheet overlay

---

### Phase 5b: Component Integration & Interactive Features
**Description:** Fix card compactness, use all design system components in real pages, add task edit/delete, kanban board drag-and-drop, and loading skeletons.

**Status:** Completed

**Sub Tasks:**
- [x] Fix card compactness to match `/design` page (p-4, gap-3, text-2xl stats, text-sm headings)
- [x] Replace inline filter chip HTML with actual `FilterChip`/`FilterChipGroup` components
- [x] Replace inline tag buttons with `Badge variant="secondary"` components
- [x] Add `Progress` (linear) bar in dashboard list cards alongside `ProgressRing`
- [x] Use `Tooltip` component on action buttons (status update, checkbox)
- [x] Add `TaskEditSheet` — Sheet slide-over for editing task details (description, deadline, importance, status, tags)
- [x] Add task delete with `AlertDialog` confirmation (new server action)
- [x] Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for drag-and-drop
- [x] Add `Tabs` component for List/Board view toggle on task list page
- [x] Build `KanbanBoard` component with drag-and-drop across status columns
- [x] Add `CircularDate` xs size for compact kanban cards
- [x] Add `Checkbox` for one-click task completion in list view cards
- [x] Add `QuickAddDialog` using `Dialog` component for rapid task creation
- [x] Split "New Task" button into "Quick Add" (dialog) + "Full Form" (page link)
- [x] Add `DashboardSkeleton` and `ListViewSkeleton` loading components
- [x] Add `loading.tsx` files for dashboard and list pages
- [x] Add `quickCreateTask` server action for dialog-based task creation
- [x] Add `editTask` and `deleteTask` server actions in list page
- [x] Lint + build pass clean

**Summary of what has been done:**
- **Card compactness:** BentoCard default padding reduced from `p-4 sm:p-6` to `p-4`, BentoGrid gap from `gap-5` to `gap-3`, StatCard value from `text-3xl` to `text-2xl`, AppShell main content padding compacted
- **Component usage:** All 32 shadcn components are now actively used in real pages:
  - `FilterChip`/`FilterChipGroup` replaces inline filter chip spans
  - `Badge variant="secondary"` replaces inline tag buttons
  - `Progress` linear bar added to dashboard list cards
  - `Tooltip` on status update buttons and checkboxes
  - `Sheet` for task edit slide-over panel
  - `AlertDialog` for delete task confirmation
  - `Dialog` for quick task creation
  - `Tabs` for List/Board view toggle
  - `Checkbox` for one-click task completion
  - `Skeleton` for loading states (dashboard + list pages)
- **Task edit:** Click any task card to open a Sheet slide-over with full edit form (description, deadline, importance, status, tags), save/cancel buttons, and delete with AlertDialog confirmation
- **Task delete:** AlertDialog confirmation dialog, server action deletes TaskInstance
- **Kanban board:** 5 status columns (DRAFT, TODO, IN_PROGRESS, COMPLETED, FAILED), drag-and-drop using @dnd-kit, respects status transition rules, compact task cards with drag handles, click to edit
- **Quick add:** Dialog-based task creation with description, deadline, importance, and tags fields. Creates both TaskTemplate and TaskInstance.
- **Loading states:** Skeleton components for dashboard (stat cards + list cards) and list view (header + filters + task cards), integrated via Next.js `loading.tsx` convention
- **3 new server actions:** `editTask` (update task fields + status), `deleteTask` (delete with permission check), `quickCreateTask` (create template + instance from dialog)

**What is left to do:**
- Nothing — completed

**Notes:**
- @dnd-kit v6.3.1 (core), v10.0.0 (sortable) — compatible with React 19
- Kanban drag-and-drop respects status transition rules (DRAFT can only go to TODO, etc.)
- Quick add creates both TaskTemplate and TaskInstance in one action
- All 32 shadcn components now actively used in real application pages
- Build passes clean with no lint errors

---

### Phase 5c: Layout Alignment to /design Spec
**Description:** Align the entire app layout, navigation, card structures, and spacing to exactly match the `/design` showcase page.

**Status:** Completed

**Sub Tasks:**
- [x] Rewrite TopBar: circle IconBtn hamburger, round `bg-foreground` logo, avatar with coral fallback + name/title visible, search icon, centered `max-w-5xl` layout
- [x] Rewrite AppShell: remove breadcrumbs bar, `max-w-5xl mx-auto` centering, sidebar defaults collapsed, compact `py-6` content area
- [x] Add hero row to dashboard: CircularDate lg + weekday/month text + PillButton "Show my Tasks" + greeting card (matches /design hero row)
- [x] Rewrite dashboard list cards: header + ProgressRing in same row, subtitle "N tasks · N overdue", Progress bar, percentage text, Badge tags, PillButton "Open" (exact match to /design "List Cards" section)
- [x] Rewrite dashboard "New List" card: circle Plus icon, text-sm heading, text-[0.6rem] subtitle, PillButton outline (exact match to /design)
- [x] Rewrite task cards: CircularDate + title/ImportanceBadge row + due text + tags inline with StatusBadge ml-auto (exact match to /design "Task Cards" section)
- [x] Remove bulky status select/Update form from task cards (edit via Sheet slide-over instead)
- [x] Completed tasks get `opacity-70` + `accent="success"` (matching /design completed card)
- [x] Update sidebar logo to round `bg-foreground` circle matching TopBar
- [x] Update footer: single-line centered `text-[0.6rem]` matching /design
- [x] Update DashboardSkeleton to match new hero + list card layout
- [x] Update ListViewSkeleton to match new task card layout
- [x] Lint + build pass clean

**Summary of what has been done:**
- **TopBar:** Complete rewrite from flat SidebarTrigger + inline search to the `/design` page pattern: circle icon buttons (IconBtn component), round logo `bg-foreground`, avatar with coral fallback and user name/title visible, search icon + hidden input on lg screens, all centered at `max-w-5xl`
- **AppShell:** Removed breadcrumb bar (not in /design), content area now uses `mx-auto max-w-5xl w-full px-5 py-6` for centered compact layout, sidebar defaults to collapsed
- **Dashboard:** Added hero row with large CircularDate, weekday/month text, separator, PillButton, and greeting card. List cards completely restructured to match /design exactly.
- **Task cards:** Simplified to match /design pattern — removed checkbox, select dropdown, and Update button from the card surface. Task cards now show CircularDate + description/importance + due text + tags inline with StatusBadge. Clicking a card opens the edit Sheet for full interaction.
- **Footer:** Simplified to single-line centered text matching /design
- All loading skeletons updated to match new layouts

**What is left to do:**
- Nothing — completed

**Notes:**
- 12 commits on `ui-redesign` branch total
- The app pages now visually match the `/design` showcase page
- Navigation available via sidebar (hamburger toggle) and avatar dropdown menu
- Build passes clean with no lint errors

---

### Phase 5d: Navigation Overhaul — Replace Sidebar with Horizontal Nav
**Description:** Remove the sidebar entirely and replace it with a horizontal navigation bar in the TopBar. Streamline the layout by removing the greeting/hero section from the dashboard, fixing footer alignment, and improving task list sizing.

**Status:** Completed

**Sub Tasks:**
- [x] Remove sidebar from AppShell (SidebarProvider, SidebarInset, AppSidebar)
- [x] Rewrite TopBar with horizontal nav links for desktop (Dashboard | My Lists | Admin)
- [x] Add hamburger + Sheet mobile menu for mobile/tablet (hidden on desktop via `lg:hidden`)
- [x] Move "Show my Tasks" PillButton from dashboard hero to navbar
- [x] Center global search input in the navbar
- [x] Remove greeting/hero section (CircularDate + greeting card) from dashboard
- [x] Fix footer layout: copyright left-aligned, version right-aligned (flex justify-between)
- [x] Widen TasksList card container from max-w-2xl to max-w-3xl for better consistency
- [x] Clean up sidebarLists prop threading from all 5 server pages and 5 content components
- [x] Remove unused sidebar data queries from server pages (reduced DB calls)
- [x] Update DashboardSkeleton to remove hero skeleton
- [x] Fix loading.tsx files to use simplified AppShell
- [x] Lint + build pass clean

**Summary of what has been done:**
- **AppShell:** Completely simplified — removed SidebarProvider, SidebarInset, AppSidebar imports. Now just uses TooltipProvider > div > TopBar > main > Footer > Toaster. No more `lists` or `breadcrumbOverrides` props.
- **TopBar (mobile/tablet):** Hamburger icon button + "T TodoApp" logo only visible below `lg` breakpoint. Hamburger opens a Sheet with nav links (Dashboard, My Lists, Admin) with active state styling (coral text + bg). Sheet also includes "Show my Tasks" pill button.
- **TopBar (desktop):** Horizontal nav links (Dashboard | My Lists | Admin) with pill-shaped active states (coral bg/text). "Show my Tasks" pill button next to nav. Centered search input with search icon. Right side: + New button and avatar dropdown.
- **Dashboard:** Removed entire hero section (CircularDate, weekday/month text, separator, PillButton, greeting card). Dashboard now starts directly with stat cards. Removed `userName` prop since greeting is gone.
- **Footer:** Changed from centered single line to `flex justify-between` with copyright left and version right.
- **TasksList:** Widened card container from `max-w-2xl` to `max-w-3xl`.
- **Prop cleanup:** Removed `SidebarListItem` type, `sidebarLists` prop, and `breadcrumbOverrides` prop from all content components. Removed sidebar data queries from 5 server pages (app/page.tsx, lists/[id]/page.tsx, lists/[id]/tasks/new/page.tsx, lists/new/page.tsx, admin/recurrence/page.tsx). This also reduces unnecessary database queries.

**What is left to do:**
- Merge `ui-redesign` branch to `main` (pending user approval)

**Notes:**
- 14 commits on `ui-redesign` branch total
- Sidebar component file (`app-sidebar.tsx`) still exists but is no longer imported anywhere
- `useSidebar` hook no longer used outside of the sidebar component itself
- Navigation now uses `usePathname()` for active state detection
- Mobile Sheet menu uses the shadcn Sheet component (already installed)
- Build passes clean with no lint errors, all 12 static pages generate successfully

---

### Phase 5e: Component Polish & Seed Data
**Description:** Replace all remaining native HTML form elements with shadcn/ui equivalents, replace linear Progress bars with circular ProgressRing, and seed the database with realistic demo data.

**Status:** Completed

**Sub Tasks:**
- [x] Add prisma seed config to package.json
- [x] Write and run seed script (alice@example.com / password123, 5 lists, 42 tasks)
- [x] Replace 11 native `<select>` elements with shadcn `Select` (Radix) across 4 files
- [x] Replace 2 native `<input type="checkbox">` with shadcn `Checkbox` across 2 files
- [x] Replace linear `Progress` bar with circular `ProgressRing` in dashboard and list view
- [x] Lint + build pass clean

**Summary of what has been done:**
- **Seed data:** Created `prisma/seed.ts` with user Alice Johnson (alice@example.com / password123) and 5 lists: Work Projects (12 tasks), Personal Errands (8 tasks), Learning & Development (9 tasks), Home Renovation (7 tasks), Fitness Goals (6 tasks). Tasks have varied statuses, importance levels, tags, and deadlines. Added `"prisma": { "seed": "bun run prisma/seed.ts" }` to package.json.
- **shadcn Select:** Replaced all native `<select>` elements with Radix Select using the `name` prop for native form submission support. Files: `list-view-content.tsx` (sort dropdown), `task-edit-sheet.tsx` (importance + status), `quick-add-dialog.tsx` (importance, status, frequency, weekday), `new-task-content.tsx` (importance, status, frequency, weekday).
- **shadcn Checkbox:** Replaced native `<input type="checkbox">` with Radix Checkbox in `quick-add-dialog.tsx` and `new-task-content.tsx` (recurring task toggle).
- **ProgressRing:** Replaced linear `Progress` bar with circular `ProgressRing` (sm size) in `dashboard-content.tsx` (list cards) and `list-view-content.tsx` (list header card). Design page keeps both for reference.

**What is left to do:**
- Merge `ui-redesign` branch to `main` (pending user approval)

**Notes:**
- Radix Select supports `name` prop which renders a hidden `<input>` for native form submission — no manual hidden inputs needed
- Task edit sheet uses `key={task.id}` on form to remount Select components with correct defaultValue when switching between tasks
- 7 commits on `ui-redesign` branch total (6 prior + 1 new)

---

## Future Plans

### Description
After redesign is merged, the following features could be considered:

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
- UI/UX Redesign: Completed (Phase 5 through 5e), pending merge
- Shared lists: Post-merge
- AI features: Future roadmap

### Dependencies and Requirements
- TaskListMember model and permission system must be in place (done)
- Clean service layer around tasks for AI context feeding (done)
- Authorization checks reusable by AI endpoints (done)

---

## Current Project State

### Technology Stack
- **Framework:** Next.js 16.1.6 (App Router)
- **UI:** React 19.2.3, Tailwind CSS 4, Base UI + Radix UI, shadcn/ui (radix-nova style)
- **Package Manager:** Bun
- **Drag & Drop:** @dnd-kit/core 6.3.1, @dnd-kit/sortable 10.0.0, @dnd-kit/utilities 3.2.2
- **Components Available:** alert-dialog, avatar, badge, breadcrumb, button, card, checkbox, collapsible, combobox, dialog, drawer, dropdown-menu, field, hover-card, input, input-group, label, popover, progress, scroll-area, select, separator, sheet, sidebar, skeleton, sonner, table, tabs, textarea, toggle, toggle-group, tooltip (32 total)

### Custom Layout Components
- `components/layout/app-shell.tsx` - Main authenticated shell with TopBar + main content + Footer (no sidebar)
- `components/layout/top-bar.tsx` - Horizontal nav (desktop) + hamburger/Sheet (mobile) + centered search + avatar dropdown
- `components/layout/footer.tsx` - Copyright left, version right footer
- `components/layout/breadcrumbs.tsx` - Route-aware breadcrumb trail (currently unused)
- `components/layout/app-sidebar.tsx` - (Legacy) Collapsible sidebar, no longer imported

### Custom UI Primitives
- `components/ui/bento-card.tsx` - Ring-bordered card with hover effect for bento grids
- `components/ui/pill-button.tsx` - Rounded-full button with arrow icon
- `components/ui/filter-chip.tsx` - Dismissible filter tag (FilterChip + FilterChipGroup)
- `components/ui/circular-date.tsx` - Round date display (day + month) — xs/sm/md/lg sizes
- `components/ui/progress-ring.tsx` - Circular SVG progress indicator
- `components/ui/status-badge.tsx` - Color-coded task status badge
- `components/ui/importance-badge.tsx` - Color-coded importance indicator
- `components/ui/stat-card.tsx` - Summary metric card
- `components/ui/empty-state.tsx` - Empty state with icon, title, CTA

### Page Components (extracted client components)
- `components/dashboard/dashboard-content.tsx` - Dashboard bento grid with stats and list cards
- `components/dashboard/dashboard-skeleton.tsx` - Loading skeleton for dashboard
- `components/lists/list-view-content.tsx` - Task list view with filters, tabs (list/board), task cards, checkbox toggle
- `components/lists/list-view-skeleton.tsx` - Loading skeleton for list view
- `components/lists/task-edit-sheet.tsx` - Sheet slide-over for task editing with delete confirmation
- `components/lists/kanban-board.tsx` - Drag-and-drop kanban board with status columns
- `components/lists/quick-add-dialog.tsx` - Dialog for rapid task creation
- `components/lists/new-task-content.tsx` - Full task form with recurrence
- `components/lists/new-list-content.tsx` - New list form
- `components/admin/recurrence-content.tsx` - Recurrence logs with stats + table
