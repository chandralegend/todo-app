"use client";

import { useState } from "react";
import {
  ListTodo,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  Edit,
  Inbox,
  TrendingUp,
  Menu,
  Lock,
  BarChart3,
  RefreshCw,
  Mic,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";

import { BentoCard, BentoGrid } from "@/components/ui/bento-card";
import { PillButton } from "@/components/ui/pill-button";
import { FilterChip, FilterChipGroup } from "@/components/ui/filter-chip";
import { CircularDate } from "@/components/ui/circular-date";
import { ProgressRing } from "@/components/ui/progress-ring";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImportanceBadge } from "@/components/ui/importance-badge";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";

/* ─── Helpers ─── */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function IconButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`flex items-center justify-center rounded-full border border-border bg-card p-3 transition-colors hover:bg-muted ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

/* ─── Page ─── */
export default function DesignPage() {
  const [chipFilters, setChipFilters] = useState([
    { label: "Team", value: "" },
    { label: "Insights", value: "" },
    { label: "Today", value: "" },
  ]);

  const [togglePressed, setTogglePressed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-background">
        {/* ══════════════════════════════════════════════════════
            HERO / HEADER - mimics the reference top bar
        ══════════════════════════════════════════════════════ */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <IconButton>
                <Menu className="size-5 text-foreground" />
              </IconButton>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background font-bold text-sm">
                  T
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">TodoApp</p>
                  <p className="text-xs text-muted-foreground">Design System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IconButton>
                <Plus className="size-5 text-foreground" />
              </IconButton>
              <Avatar className="h-10 w-10 border border-border">
                <AvatarFallback className="bg-coral-light text-coral font-semibold text-sm">
                  DT
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-tight">Dwayne Tatum</p>
                <p className="text-xs text-muted-foreground">CEO Assistant</p>
              </div>
              <IconButton>
                <Search className="size-5 text-foreground" />
              </IconButton>
              <div className="hidden lg:block relative">
                <Input
                  placeholder="Start searching ..."
                  className="w-56 rounded-full border-border bg-card pl-4 pr-4 h-10"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-8 py-10 space-y-16">
          {/* ══════════════════════════════════════════════════════
              SECTION 1: HERO BENTO ROW (like the reference date + CTA row)
          ══════════════════════════════════════════════════════ */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
              {/* Date + CTA cluster */}
              <div className="flex items-center gap-5">
                <CircularDate date={new Date()} size="lg" />
                <div className="hidden sm:block">
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", { weekday: "short" })},
                  </p>
                  <p className="text-sm font-medium">
                    {new Date().toLocaleDateString("en-US", { month: "long" })}
                  </p>
                </div>
                <Separator orientation="vertical" className="h-10 hidden sm:block" />
                <PillButton variant="primary" size="md">
                  Show my Tasks
                </PillButton>
                <IconButton>
                  <Calendar className="size-5 text-foreground" />
                </IconButton>
              </div>
              {/* Greeting */}
              <div className="rounded-2xl border border-border bg-card px-8 py-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Hey, Need help?
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Just ask me anything!
                  </p>
                </div>
                <IconButton className="hidden sm:flex">
                  <Mic className="size-5 text-foreground" />
                </IconButton>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════
              SECTION 2: BENTO GRID (varied card sizes like reference)
          ══════════════════════════════════════════════════════ */}
          <Section
            title="Bento Dashboard"
            description="Cards with thin borders, generous padding, varied grid sizes."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Large card - spans 2 cols */}
              <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-border p-2">
                      <ListTodo className="size-5 text-muted-foreground" />
                    </div>
                    <p className="font-bold">Work Tasks</p>
                  </div>
                  <FilterChip label="Weekly" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Total tasks
                </p>
                <p className="text-4xl font-bold">23</p>
                <div className="flex gap-3 pt-2">
                  <PillButton size="sm" variant="primary">Complete</PillButton>
                  <PillButton size="sm" variant="outline" showArrow={false}>View</PillButton>
                </div>
              </div>

              {/* Icon card - small */}
              <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center justify-center text-center gap-3">
                <div className="rounded-full border border-border p-4">
                  <Lock className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">System Lock</p>
              </div>

              {/* Stat card */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="rounded-full border border-border p-2">
                    <Clock className="size-5 text-muted-foreground" />
                  </div>
                  <div className="rounded-full border border-border p-2">
                    <BarChart3 className="size-5 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-3xl font-bold mt-3">13 Days</p>
                <p className="text-sm text-muted-foreground">109 hours, 23 minutes</p>
                {/* Dot pattern */}
                <div className="flex gap-1 pt-2 flex-wrap">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < 8 ? "bg-coral" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Growth rate with ring */}
              <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center justify-center">
                <ProgressRing value={36} size="lg" />
                <p className="text-sm text-muted-foreground mt-3">Growth rate</p>
              </div>

              {/* Activity card - spans 2 cols */}
              <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold">Activity manager</p>
                  <div className="flex items-center gap-2">
                    <FilterChip label="Filters" />
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search in activities ..."
                    className="pl-9 rounded-full border-border h-10"
                  />
                </div>
                <FilterChipGroup>
                  <FilterChip
                    label="Team"
                    active
                  />
                  <FilterChip
                    label="Insights"
                    onRemove={() => {}}
                  />
                  <FilterChip
                    label="Today"
                    onRemove={() => {}}
                  />
                </FilterChipGroup>
                {/* Mini bento inside */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="rounded-xl border border-border bg-background p-4 space-y-1">
                    <p className="text-2xl font-bold">$ 43.20</p>
                    <p className="text-xs text-muted-foreground">USD</p>
                    {/* Mini bar chart */}
                    <div className="flex items-end gap-1 h-8 pt-2">
                      {[60, 80, 40, 90, 50, 70, 45].map((h, i) => (
                        <div
                          key={i}
                          className={`w-2 rounded-sm ${
                            i % 3 === 0 ? "bg-coral" : "bg-border"
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4 space-y-2">
                    <p className="text-sm font-semibold">Business plans</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-coral" />
                        <span className="text-xs text-muted-foreground">Bank loans</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-coral-muted" />
                        <span className="text-xs text-muted-foreground">Accounting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-coral" />
                        <span className="text-xs text-muted-foreground">HR management</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4 flex flex-col items-center justify-center text-center gap-2">
                    <div className="text-coral text-2xl">*</div>
                    <p className="text-xs font-medium">Wallet Verification</p>
                    <p className="text-[0.65rem] text-muted-foreground">Enable 2-step</p>
                    <PillButton size="sm" variant="primary" showArrow={false}>
                      Enable
                    </PillButton>
                  </div>
                </div>
              </div>

              {/* Revenue card */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-2">
                <div className="rounded-full border border-border p-2 w-fit">
                  <TrendingUp className="size-5 text-coral" />
                </div>
                <p className="text-2xl font-bold text-coral mt-3">$ 16,073.49</p>
                <p className="text-xs text-muted-foreground">Monthly revenue</p>
                {/* Wavy line placeholder */}
                <div className="h-8 flex items-end">
                  <svg viewBox="0 0 100 20" className="w-full h-6 text-coral/40">
                    <path
                      d="M0 15 Q10 5, 20 10 T40 8 T60 12 T80 6 T100 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 3: COLOR PALETTE
          ══════════════════════════════════════════════════════ */}
          <Section title="Color Palette" description="Warm cream background, coral accent, neutral borders.">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Background", cls: "bg-background border border-border", text: "text-foreground" },
                { name: "Card", cls: "bg-card border border-border", text: "text-foreground" },
                { name: "Primary", cls: "bg-primary", text: "text-white" },
                { name: "Coral", cls: "bg-coral", text: "text-white" },
                { name: "Coral Light", cls: "bg-coral-light border border-border", text: "text-coral" },
                { name: "Coral Muted", cls: "bg-coral-muted", text: "text-white" },
                { name: "Muted", cls: "bg-muted border border-border", text: "text-foreground" },
                { name: "Secondary", cls: "bg-secondary border border-border", text: "text-foreground" },
                { name: "Destructive", cls: "bg-destructive", text: "text-white" },
                { name: "Status Draft", cls: "bg-status-draft", text: "text-white" },
                { name: "Status Todo", cls: "bg-status-todo", text: "text-white" },
                { name: "Status Done", cls: "bg-status-completed", text: "text-white" },
              ].map((c) => (
                <div key={c.name} className="flex flex-col items-center gap-2">
                  <div className={`h-16 w-full rounded-xl ${c.cls} flex items-center justify-center`}>
                    <span className={`text-xs font-medium ${c.text}`}>Aa</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 4: TYPOGRAPHY
          ══════════════════════════════════════════════════════ */}
          <Section title="Typography" description="Outfit for headings, Geist for body.">
            <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
              <h1 className="text-4xl font-bold tracking-tight">Heading 1 — Bold 4xl</h1>
              <h2 className="text-3xl font-bold tracking-tight">Heading 2 — Bold 3xl</h2>
              <h3 className="text-2xl font-semibold">Heading 3 — Semibold 2xl</h3>
              <h4 className="text-xl font-semibold">Heading 4 — Semibold xl</h4>
              <p className="text-base">Body — Regular base text for descriptions and content.</p>
              <p className="text-sm text-muted-foreground">Muted — Secondary info, timestamps, labels.</p>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Section Label — Tracking widest
              </p>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 5: BUTTONS
          ══════════════════════════════════════════════════════ */}
          <Section title="Buttons" description="Pill buttons with coral accent and icon buttons with circle borders.">
            <div className="rounded-2xl border border-border bg-card p-8 space-y-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                  Pill Buttons
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <PillButton variant="primary" size="lg">Create Task</PillButton>
                  <PillButton variant="primary" size="md">Show my Tasks</PillButton>
                  <PillButton variant="primary" size="sm">Open</PillButton>
                  <PillButton variant="outline" size="md">View All</PillButton>
                  <PillButton variant="secondary" size="md">Filter</PillButton>
                  <PillButton variant="ghost" size="md" showArrow={false}>Cancel</PillButton>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                  Icon Buttons (Circle Border)
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <IconButton><Menu className="size-5 text-foreground" /></IconButton>
                  <IconButton><Plus className="size-5 text-foreground" /></IconButton>
                  <IconButton><Search className="size-5 text-foreground" /></IconButton>
                  <IconButton><Calendar className="size-5 text-foreground" /></IconButton>
                  <IconButton><RefreshCw className="size-5 text-foreground" /></IconButton>
                  <IconButton><Eye className="size-5 text-foreground" /></IconButton>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                  shadcn Base Buttons
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 6: BADGES & STATUS
          ══════════════════════════════════════════════════════ */}
          <Section title="Badges & Status" description="Status badges with dot indicators and importance levels.">
            <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Status</p>
                <div className="flex flex-wrap gap-3">
                  <StatusBadge status="DRAFT" />
                  <StatusBadge status="TODO" />
                  <StatusBadge status="IN_PROGRESS" />
                  <StatusBadge status="COMPLETED" />
                  <StatusBadge status="FAILED" />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Importance</p>
                <div className="flex flex-wrap gap-3">
                  <ImportanceBadge importance="LOW" />
                  <ImportanceBadge importance="MEDIUM" />
                  <ImportanceBadge importance="HIGH" />
                  <ImportanceBadge importance="CRITICAL" />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                  shadcn Badges
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 7: FILTER CHIPS & DATES
          ══════════════════════════════════════════════════════ */}
          <Section title="Filter Chips & Circular Dates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Filter Chips</p>
                <FilterChipGroup>
                  {chipFilters.map((chip, i) => (
                    <FilterChip
                      key={chip.label}
                      label={chip.label}
                      active={i === 0}
                      onRemove={i > 0 ? () => setChipFilters((p) => p.filter((_, j) => j !== i)) : undefined}
                    />
                  ))}
                  {chipFilters.length < 3 && (
                    <button
                      className="text-xs text-coral underline"
                      onClick={() =>
                        setChipFilters([
                          { label: "Team", value: "" },
                          { label: "Insights", value: "" },
                          { label: "Today", value: "" },
                        ])
                      }
                    >
                      reset
                    </button>
                  )}
                </FilterChipGroup>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground pt-4">Static Tags</p>
                <FilterChipGroup>
                  <FilterChip label="#work" />
                  <FilterChip label="#personal" />
                  <FilterChip label="#urgent" />
                </FilterChipGroup>
              </div>

              <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Circular Dates
                </p>
                <div className="flex items-end gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <CircularDate date={new Date()} size="lg" />
                    <span className="text-xs text-muted-foreground">Today</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <CircularDate date={new Date(2026, 1, 25)} size="md" />
                    <span className="text-xs text-muted-foreground">Future</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <CircularDate date={new Date(2026, 1, 15)} size="md" overdue />
                    <span className="text-xs text-muted-foreground">Overdue</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <CircularDate date={new Date(2026, 11, 25)} size="sm" />
                    <span className="text-xs text-muted-foreground">Small</span>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 8: PROGRESS
          ══════════════════════════════════════════════════════ */}
          <Section title="Progress Indicators">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Progress Rings</p>
                <div className="flex items-end gap-8">
                  <ProgressRing value={0} size="sm" />
                  <ProgressRing value={25} size="sm" />
                  <ProgressRing value={50} size="md" />
                  <ProgressRing value={75} size="md" />
                  <ProgressRing value={100} size="lg" />
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Linear Progress</p>
                <div className="space-y-3">
                  {[0, 40, 67, 100].map((v) => (
                    <div key={v} className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{v}%</span>
                      </div>
                      <Progress value={v} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 9: STAT CARDS
          ══════════════════════════════════════════════════════ */}
          <Section title="Stat Cards" description="Summary metrics with circle icon buttons.">
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Today" value={5} description="tasks due today" icon={Calendar} />
              <StatCard label="Overdue" value={2} description="tasks past deadline" icon={AlertTriangle} />
              <StatCard label="In Progress" value={3} description="tasks active now" icon={TrendingUp} />
              <StatCard label="Completed" value={12} description="this week" icon={CheckCircle2} />
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 10: TASK CARD PREVIEWS
          ══════════════════════════════════════════════════════ */}
          <Section title="Task Cards" description="How task list items will look.">
            <div className="max-w-2xl space-y-4">
              <BentoCard className="flex items-start gap-5 !p-5">
                <CircularDate date={new Date(2026, 1, 22)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold">Review PR #234</h4>
                    <ImportanceBadge importance="HIGH" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">Due tomorrow</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">#code</Badge>
                    <Badge variant="secondary">#urgent</Badge>
                    <StatusBadge status="TODO" className="ml-auto" />
                  </div>
                </div>
              </BentoCard>

              <BentoCard accent="destructive" className="flex items-start gap-5 !p-5">
                <CircularDate date={new Date(2026, 1, 18)} overdue />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold">Fix login bug</h4>
                    <ImportanceBadge importance="CRITICAL" />
                  </div>
                  <p className="text-sm text-destructive font-medium mt-0.5">Overdue by 3 days</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">#bug</Badge>
                    <StatusBadge status="IN_PROGRESS" className="ml-auto" />
                  </div>
                </div>
              </BentoCard>

              <BentoCard accent="success" className="flex items-start gap-5 !p-5 opacity-70">
                <CircularDate date={new Date(2026, 1, 20)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold line-through text-muted-foreground">Write documentation</h4>
                    <ImportanceBadge importance="MEDIUM" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">Completed 2 days ago</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">#docs</Badge>
                    <StatusBadge status="COMPLETED" className="ml-auto" />
                  </div>
                </div>
              </BentoCard>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 11: FORM ELEMENTS
          ══════════════════════════════════════════════════════ */}
          <Section title="Form Elements">
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Text Input</label>
                  <Input placeholder="Enter task description..." className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-9 rounded-full" />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Textarea</label>
                  <Textarea placeholder="Describe the task..." rows={3} className="rounded-xl" />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium">Checkboxes</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="c1" />
                      <label htmlFor="c1" className="text-sm">Unchecked</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="c2" defaultChecked />
                      <label htmlFor="c2" className="text-sm">Checked</label>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium">Toggle</label>
                  <Toggle
                    pressed={togglePressed}
                    onPressedChange={setTogglePressed}
                    className="data-[state=on]:bg-coral data-[state=on]:text-white rounded-full px-4"
                  >
                    {togglePressed ? "Recurring ON" : "Recurring OFF"}
                  </Toggle>
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 12: TABS
          ══════════════════════════════════════════════════════ */}
          <Section title="Tabs">
            <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <p className="text-sm text-muted-foreground p-4">All tasks shown here.</p>
                </TabsContent>
                <TabsContent value="today">
                  <p className="text-sm text-muted-foreground p-4">Today&apos;s tasks.</p>
                </TabsContent>
              </Tabs>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 13: DIALOGS, SHEETS, ALERTS
          ══════════════════════════════════════════════════════ */}
          <Section title="Overlays" description="Dialog, Sheet, AlertDialog, Tooltip.">
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="flex flex-wrap items-center gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <PillButton variant="primary" showArrow={false}>Open Dialog</PillButton>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>New Task</DialogTitle>
                      <DialogDescription>Add a task to your list.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Textarea placeholder="What needs to be done?" rows={3} className="rounded-xl" />
                      <div className="flex justify-end gap-3">
                        <PillButton variant="outline" showArrow={false}>Cancel</PillButton>
                        <PillButton variant="primary">Create</PillButton>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Sheet>
                  <SheetTrigger asChild>
                    <PillButton variant="outline" showArrow={false}>Open Sheet</PillButton>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Task Details</SheetTitle>
                      <SheetDescription>View and manage task info.</SheetDescription>
                    </SheetHeader>
                    <div className="p-4 space-y-4">
                      <h3 className="text-lg font-semibold">Review PR #234</h3>
                      <StatusBadge status="IN_PROGRESS" />
                      <Separator />
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deadline</span>
                          <span>Feb 22, 2026</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Importance</span>
                          <ImportanceBadge importance="HIGH" />
                        </div>
                      </div>
                      <Separator />
                      <Button className="w-full"><Edit className="mr-2 size-4" />Edit</Button>
                      <Button variant="destructive" className="w-full"><Trash2 className="mr-2 size-4" />Delete</Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <PillButton variant="outline" showArrow={false}>Delete Alert</PillButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <IconButton><Clock className="size-5 text-foreground" /></IconButton>
                  </TooltipTrigger>
                  <TooltipContent><p>Tooltip example</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 14: SKELETONS
          ══════════════════════════════════════════════════════ */}
          <Section title="Loading Skeletons">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-border bg-card p-6 flex items-start gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ══════════════════════════════════════════════════════
              SECTION 15: EMPTY STATES
          ══════════════════════════════════════════════════════ */}
          <Section title="Empty States">
            <div className="grid gap-5 sm:grid-cols-3">
              <EmptyState
                icon={ListTodo}
                title="No lists yet"
                description="Create your first list to get started."
                action={<PillButton size="sm">Create List</PillButton>}
              />
              <EmptyState
                icon={Inbox}
                title="No tasks"
                description="Add a task to this list."
                action={<PillButton size="sm">Add Task</PillButton>}
              />
              <EmptyState
                icon={Search}
                title="No results"
                description="Try adjusting your filters."
                action={<PillButton size="sm" variant="outline" showArrow={false}>Clear Filters</PillButton>}
              />
            </div>
          </Section>

          {/* ══════════════════════════════════════════════════════
              SECTION 16: LIST CARDS (BENTO)
          ══════════════════════════════════════════════════════ */}
          <Separator className="my-4" />
          <Section title="List Cards" description="Bento grid cards for task lists.">
            <BentoGrid>
              <BentoCard>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Work Tasks</h3>
                    <p className="text-sm text-muted-foreground mt-1">12 tasks &middot; 3 overdue</p>
                  </div>
                  <ProgressRing value={67} size="sm" />
                </div>
                <Progress value={67} className="mt-4" />
                <p className="text-xs text-muted-foreground mt-1">67% complete</p>
                <div className="mt-3 flex gap-1.5">
                  <Badge variant="secondary">#work</Badge>
                  <Badge variant="secondary">#dev</Badge>
                </div>
                <div className="mt-4">
                  <PillButton size="sm">Open</PillButton>
                </div>
              </BentoCard>

              <BentoCard>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Personal</h3>
                    <p className="text-sm text-muted-foreground mt-1">8 tasks &middot; 0 overdue</p>
                  </div>
                  <ProgressRing value={80} size="sm" />
                </div>
                <Progress value={80} className="mt-4" />
                <p className="text-xs text-muted-foreground mt-1">80% complete</p>
                <div className="mt-3 flex gap-1.5">
                  <Badge variant="secondary">#home</Badge>
                </div>
                <div className="mt-4">
                  <PillButton size="sm">Open</PillButton>
                </div>
              </BentoCard>

              <BentoCard interactive={false} className="border-dashed flex flex-col items-center justify-center text-center">
                <div className="rounded-full border border-border p-4 mb-3">
                  <Plus className="size-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">New List</h3>
                <p className="text-xs text-muted-foreground mt-1">Organize your tasks</p>
                <PillButton size="sm" variant="outline" className="mt-4">Create</PillButton>
              </BentoCard>
            </BentoGrid>
          </Section>

          {/* Footer */}
          <div className="border-t border-border pt-8 pb-4 text-center text-xs text-muted-foreground">
            TodoApp Design System &middot; v0.1.0 &middot; Warm Coral Theme
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
