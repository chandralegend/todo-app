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
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription,
  SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
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
function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

function IconBtn({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button className={`flex items-center justify-center rounded-full border border-border bg-card p-2 transition-colors hover:bg-muted ${className ?? ""}`}>
      {children}
    </button>
  );
}

/* ─── Page ─── */
export default function DesignPage() {
  const [chipFilters, setChipFilters] = useState([
    { label: "Team" }, { label: "Insights" }, { label: "Today" },
  ]);
  const [togglePressed, setTogglePressed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-background">

        {/* ── TOP BAR ── */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-5xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBtn><Menu className="size-4" /></IconBtn>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background font-bold text-xs">T</div>
                <div className="leading-none">
                  <p className="font-semibold text-sm">TodoApp</p>
                  <p className="text-[0.65rem] text-muted-foreground">Design System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IconBtn><Plus className="size-4" /></IconBtn>
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-coral-light text-coral font-semibold text-xs">DT</AvatarFallback>
              </Avatar>
              <div className="hidden md:block leading-none">
                <p className="text-xs font-medium">Dwayne Tatum</p>
                <p className="text-[0.65rem] text-muted-foreground">CEO Assistant</p>
              </div>
              <IconBtn><Search className="size-4" /></IconBtn>
              <Input placeholder="Search ..." className="hidden lg:block w-44 rounded-full border-border bg-card pl-3 h-8 text-xs" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-5 py-6 space-y-8">

          {/* ── HERO ROW ── */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-center">
              <div className="flex items-center gap-3">
                <CircularDate date={new Date()} size="lg" />
                <div className="hidden sm:block leading-tight">
                  <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "short" })},</p>
                  <p className="text-xs font-medium">{new Date().toLocaleDateString("en-US", { month: "long" })}</p>
                </div>
                <Separator orientation="vertical" className="h-8 hidden sm:block" />
                <PillButton variant="primary" size="sm">Show my Tasks</PillButton>
                <IconBtn><Calendar className="size-4" /></IconBtn>
              </div>
              <div className="rounded-2xl border border-border bg-card px-5 py-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">Hey, Need help?</h1>
                  <p className="text-sm text-muted-foreground">Just ask me anything!</p>
                </div>
                <IconBtn className="hidden sm:flex"><Mic className="size-4" /></IconBtn>
              </div>
            </div>
          </section>

          {/* ── BENTO DASHBOARD ── */}
          <Section title="Bento Dashboard" desc="Varied card sizes, thin borders, generous whitespace.">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 2-col card */}
              <div className="col-span-2 rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full border border-border p-1.5"><ListTodo className="size-4 text-muted-foreground" /></div>
                    <p className="font-bold text-sm">Work Tasks</p>
                  </div>
                  <FilterChip label="Weekly" />
                </div>
                <p className="text-[0.65rem] text-muted-foreground uppercase tracking-widest">Total tasks</p>
                <p className="text-3xl font-bold">23</p>
                <div className="flex gap-2">
                  <PillButton size="sm" variant="primary">Complete</PillButton>
                  <PillButton size="sm" variant="outline" showArrow={false}>View</PillButton>
                </div>
              </div>

              {/* Icon card */}
              <div className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className="rounded-full border border-border p-3"><Lock className="size-5 text-muted-foreground" /></div>
                <p className="text-xs font-medium">System Lock</p>
              </div>

              {/* Stat card */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="rounded-full border border-border p-1.5"><Clock className="size-4 text-muted-foreground" /></div>
                  <div className="rounded-full border border-border p-1.5"><BarChart3 className="size-4 text-muted-foreground" /></div>
                </div>
                <p className="text-2xl font-bold pt-1">13 Days</p>
                <p className="text-xs text-muted-foreground">109 hours, 23 min</p>
                <div className="flex gap-0.5 pt-1 flex-wrap">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 8 ? "bg-coral" : "bg-border"}`} />
                  ))}
                </div>
              </div>

              {/* Growth ring */}
              <div className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center justify-center">
                <ProgressRing value={36} size="md" />
                <p className="text-xs text-muted-foreground mt-2">Growth rate</p>
              </div>

              {/* Activity 2-col */}
              <div className="col-span-2 rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">Activity manager</p>
                  <FilterChip label="Filters" />
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input placeholder="Search in activities ..." className="pl-8 rounded-full border-border h-8 text-xs" />
                </div>
                <FilterChipGroup>
                  <FilterChip label="Team" active />
                  <FilterChip label="Insights" onRemove={() => {}} />
                  <FilterChip label="Today" onRemove={() => {}} />
                </FilterChipGroup>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-border bg-background p-3 space-y-1">
                    <p className="text-lg font-bold">$ 43.20</p>
                    <p className="text-[0.6rem] text-muted-foreground">USD</p>
                    <div className="flex items-end gap-0.5 h-6 pt-1">
                      {[60, 80, 40, 90, 50, 70, 45].map((h, i) => (
                        <div key={i} className={`w-1.5 rounded-sm ${i % 3 === 0 ? "bg-coral" : "bg-border"}`} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3 space-y-1.5">
                    <p className="text-xs font-semibold">Business plans</p>
                    {["Bank loans", "Accounting", "HR mgmt"].map((t, i) => (
                      <div key={t} className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? "bg-coral-muted" : "bg-coral"}`} />
                        <span className="text-[0.6rem] text-muted-foreground">{t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3 flex flex-col items-center justify-center text-center gap-1">
                    <p className="text-[0.6rem] font-medium">Wallet Verify</p>
                    <PillButton size="sm" variant="primary" showArrow={false}>Enable</PillButton>
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
                <div className="rounded-full border border-border p-1.5 w-fit"><TrendingUp className="size-4 text-coral" /></div>
                <p className="text-xl font-bold text-coral pt-1">$ 16,073</p>
                <p className="text-[0.6rem] text-muted-foreground">Monthly revenue</p>
                <svg viewBox="0 0 100 20" className="w-full h-5 text-coral/40">
                  <path d="M0 15 Q10 5, 20 10 T40 8 T60 12 T80 6 T100 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── COLORS ── */}
          <Section title="Color Palette" desc="Warm cream bg, coral accent, neutral borders.">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {[
                { n: "Background", c: "bg-background border border-border", t: "text-foreground" },
                { n: "Card", c: "bg-card border border-border", t: "text-foreground" },
                { n: "Primary", c: "bg-primary", t: "text-white" },
                { n: "Coral", c: "bg-coral", t: "text-white" },
                { n: "Coral Light", c: "bg-coral-light border border-border", t: "text-coral" },
                { n: "Muted", c: "bg-muted border border-border", t: "text-foreground" },
                { n: "Destructive", c: "bg-destructive", t: "text-white" },
                { n: "Draft", c: "bg-status-draft", t: "text-white" },
                { n: "Todo", c: "bg-status-todo", t: "text-white" },
                { n: "In Prog", c: "bg-status-in-progress", t: "text-white" },
                { n: "Done", c: "bg-status-completed", t: "text-white" },
                { n: "Failed", c: "bg-status-failed", t: "text-white" },
              ].map((s) => (
                <div key={s.n} className="flex flex-col items-center gap-1">
                  <div className={`h-10 w-full rounded-lg ${s.c} flex items-center justify-center`}>
                    <span className={`text-[0.6rem] font-medium ${s.t}`}>Aa</span>
                  </div>
                  <span className="text-[0.6rem] text-muted-foreground">{s.n}</span>
                </div>
              ))}
            </div>
          </Section>

          <Separator />

          {/* ── TYPOGRAPHY ── */}
          <Section title="Typography" desc="Outfit headings, Geist body.">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h1 className="text-3xl font-bold tracking-tight">Heading 1 — Bold 3xl</h1>
              <h2 className="text-2xl font-bold">Heading 2 — Bold 2xl</h2>
              <h3 className="text-xl font-semibold">Heading 3 — Semibold xl</h3>
              <p className="text-sm">Body — Regular text for descriptions and content.</p>
              <p className="text-xs text-muted-foreground">Muted — Secondary info, timestamps, labels.</p>
              <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">Section Label</p>
            </div>
          </Section>

          <Separator />

          {/* ── BUTTONS ── */}
          <Section title="Buttons" desc="Pill buttons, icon circle buttons, shadcn base.">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground mb-2">Pill Buttons</p>
                <div className="flex flex-wrap items-center gap-2">
                  <PillButton variant="primary" size="lg">Create Task</PillButton>
                  <PillButton variant="primary" size="md">Show Tasks</PillButton>
                  <PillButton variant="primary" size="sm">Open</PillButton>
                  <PillButton variant="outline" size="sm">View All</PillButton>
                  <PillButton variant="secondary" size="sm">Filter</PillButton>
                  <PillButton variant="ghost" size="sm" showArrow={false}>Cancel</PillButton>
                </div>
              </div>
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground mb-2">Icon Buttons</p>
                <div className="flex flex-wrap items-center gap-2">
                  {[Menu, Plus, Search, Calendar, RefreshCw, Eye].map((Icon, i) => (
                    <IconBtn key={i}><Icon className="size-4" /></IconBtn>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground mb-2">shadcn Base</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="default">Primary</Button>
                  <Button size="sm" variant="secondary">Secondary</Button>
                  <Button size="sm" variant="outline">Outline</Button>
                  <Button size="sm" variant="ghost">Ghost</Button>
                  <Button size="sm" variant="destructive">Destructive</Button>
                  <Button size="sm" variant="link">Link</Button>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── BADGES ── */}
          <Section title="Badges & Status">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="DRAFT" /><StatusBadge status="TODO" /><StatusBadge status="IN_PROGRESS" /><StatusBadge status="COMPLETED" /><StatusBadge status="FAILED" />
                </div>
              </div>
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground mb-2">Importance</p>
                <div className="flex flex-wrap gap-2">
                  <ImportanceBadge importance="LOW" /><ImportanceBadge importance="MEDIUM" /><ImportanceBadge importance="HIGH" /><ImportanceBadge importance="CRITICAL" />
                </div>
              </div>
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground mb-2">shadcn</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge><Badge variant="secondary">Secondary</Badge><Badge variant="outline">Outline</Badge><Badge variant="destructive">Destructive</Badge>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── CHIPS & DATES ── */}
          <Section title="Filter Chips & Circular Dates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">Filter Chips</p>
                <FilterChipGroup>
                  {chipFilters.map((c, i) => (
                    <FilterChip key={c.label} label={c.label} active={i === 0}
                      onRemove={i > 0 ? () => setChipFilters((p) => p.filter((_, j) => j !== i)) : undefined} />
                  ))}
                  {chipFilters.length < 3 && (
                    <button className="text-[0.65rem] text-coral underline"
                      onClick={() => setChipFilters([{ label: "Team" }, { label: "Insights" }, { label: "Today" }])}>
                      reset
                    </button>
                  )}
                </FilterChipGroup>
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground pt-2">Tags</p>
                <FilterChipGroup>
                  <FilterChip label="#work" /><FilterChip label="#personal" /><FilterChip label="#urgent" />
                </FilterChipGroup>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">Circular Dates</p>
                <div className="flex items-end gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <CircularDate date={new Date()} size="lg" />
                    <span className="text-[0.6rem] text-muted-foreground">Today</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <CircularDate date={new Date(2026, 1, 25)} size="md" />
                    <span className="text-[0.6rem] text-muted-foreground">Future</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <CircularDate date={new Date(2026, 1, 15)} size="md" overdue />
                    <span className="text-[0.6rem] text-muted-foreground">Overdue</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <CircularDate date={new Date(2026, 11, 25)} size="sm" />
                    <span className="text-[0.6rem] text-muted-foreground">Small</span>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── PROGRESS ── */}
          <Section title="Progress Indicators">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">Rings</p>
                <div className="flex items-end gap-5">
                  <ProgressRing value={0} size="sm" /><ProgressRing value={25} size="sm" /><ProgressRing value={50} size="md" /><ProgressRing value={75} size="md" /><ProgressRing value={100} size="lg" />
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">Linear</p>
                <div className="space-y-2">
                  {[0, 40, 67, 100].map((v) => (
                    <div key={v} className="space-y-0.5">
                      <span className="text-[0.6rem] text-muted-foreground">{v}%</span>
                      <Progress value={v} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── STAT CARDS ── */}
          <Section title="Stat Cards">
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <StatCard label="Today" value={5} description="tasks due" icon={Calendar} />
              <StatCard label="Overdue" value={2} description="past deadline" icon={AlertTriangle} />
              <StatCard label="Active" value={3} description="in progress" icon={TrendingUp} />
              <StatCard label="Done" value={12} description="this week" icon={CheckCircle2} />
            </div>
          </Section>

          <Separator />

          {/* ── TASK CARDS ── */}
          <Section title="Task Cards" desc="List item previews.">
            <div className="space-y-3 max-w-2xl">
              <BentoCard className="flex items-start gap-4 !p-4">
                <CircularDate date={new Date(2026, 1, 22)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm">Review PR #234</h4>
                    <ImportanceBadge importance="HIGH" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Due tomorrow</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">#code</Badge><Badge variant="secondary">#urgent</Badge>
                    <StatusBadge status="TODO" className="ml-auto" />
                  </div>
                </div>
              </BentoCard>
              <BentoCard accent="destructive" className="flex items-start gap-4 !p-4">
                <CircularDate date={new Date(2026, 1, 18)} overdue />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm">Fix login bug</h4>
                    <ImportanceBadge importance="CRITICAL" />
                  </div>
                  <p className="text-xs text-destructive font-medium mt-0.5">Overdue 3 days</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">#bug</Badge>
                    <StatusBadge status="IN_PROGRESS" className="ml-auto" />
                  </div>
                </div>
              </BentoCard>
              <BentoCard accent="success" className="flex items-start gap-4 !p-4 opacity-70">
                <CircularDate date={new Date(2026, 1, 20)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm line-through text-muted-foreground">Write docs</h4>
                    <ImportanceBadge importance="MEDIUM" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Completed 2d ago</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">#docs</Badge>
                    <StatusBadge status="COMPLETED" className="ml-auto" />
                  </div>
                </div>
              </BentoCard>
            </div>
          </Section>

          <Separator />

          {/* ── FORMS ── */}
          <Section title="Form Elements">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Text Input</label>
                  <Input placeholder="Task description..." className="rounded-xl h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-8 rounded-full h-8 text-sm" />
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium">Textarea</label>
                  <Textarea placeholder="Describe the task..." rows={2} className="rounded-xl text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Checkboxes</label>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2"><Checkbox id="c1" /><label htmlFor="c1" className="text-xs">Unchecked</label></div>
                    <div className="flex items-center gap-2"><Checkbox id="c2" defaultChecked /><label htmlFor="c2" className="text-xs">Checked</label></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Toggle</label>
                  <Toggle pressed={togglePressed} onPressedChange={setTogglePressed}
                    className="data-[state=on]:bg-coral data-[state=on]:text-white rounded-full px-3 text-xs h-7">
                    {togglePressed ? "ON" : "OFF"}
                  </Toggle>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── TABS ── */}
          <Section title="Tabs">
            <div className="rounded-2xl border border-border bg-card p-5">
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                </TabsList>
                <TabsContent value="all"><p className="text-xs text-muted-foreground p-3">All tasks shown.</p></TabsContent>
                <TabsContent value="today"><p className="text-xs text-muted-foreground p-3">Today&apos;s tasks.</p></TabsContent>
              </Tabs>
            </div>
          </Section>

          <Separator />

          {/* ── OVERLAYS ── */}
          <Section title="Overlays" desc="Dialog, Sheet, Alert, Tooltip.">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild><PillButton variant="primary" size="sm" showArrow={false}>Dialog</PillButton></DialogTrigger>
                  <DialogContent className="rounded-2xl">
                    <DialogHeader><DialogTitle>New Task</DialogTitle><DialogDescription>Add a task.</DialogDescription></DialogHeader>
                    <div className="space-y-3 py-3">
                      <Textarea placeholder="What needs to be done?" rows={2} className="rounded-xl text-sm" />
                      <div className="flex justify-end gap-2">
                        <PillButton variant="outline" size="sm" showArrow={false}>Cancel</PillButton>
                        <PillButton variant="primary" size="sm">Create</PillButton>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Sheet>
                  <SheetTrigger asChild><PillButton variant="outline" size="sm" showArrow={false}>Sheet</PillButton></SheetTrigger>
                  <SheetContent>
                    <SheetHeader><SheetTitle>Task Details</SheetTitle><SheetDescription>View and manage.</SheetDescription></SheetHeader>
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold">Review PR #234</h3>
                      <StatusBadge status="IN_PROGRESS" />
                      <Separator />
                      <div className="text-xs space-y-1.5">
                        <div className="flex justify-between"><span className="text-muted-foreground">Deadline</span><span>Feb 22</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Importance</span><ImportanceBadge importance="HIGH" /></div>
                      </div>
                      <Separator />
                      <Button size="sm" className="w-full"><Edit className="mr-1.5 size-3.5" />Edit</Button>
                      <Button size="sm" variant="destructive" className="w-full"><Trash2 className="mr-1.5 size-3.5" />Delete</Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <AlertDialog>
                  <AlertDialogTrigger asChild><PillButton variant="outline" size="sm" showArrow={false}>Alert</PillButton></AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader><AlertDialogTitle>Delete task?</AlertDialogTitle><AlertDialogDescription>Cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Tooltip><TooltipTrigger asChild><IconBtn><Clock className="size-4" /></IconBtn></TooltipTrigger><TooltipContent><p>Tooltip</p></TooltipContent></Tooltip>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── SKELETONS ── */}
          <Section title="Skeletons">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4" /><Skeleton className="h-2.5 w-1/2" />
                  <div className="flex gap-1.5"><Skeleton className="h-4 w-14 rounded-full" /><Skeleton className="h-4 w-10 rounded-full" /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2">
                    <Skeleton className="h-2.5 w-14" /><Skeleton className="h-6 w-10" /><Skeleton className="h-2.5 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── EMPTY STATES ── */}
          <Section title="Empty States">
            <div className="grid gap-3 sm:grid-cols-3">
              <EmptyState icon={ListTodo} title="No lists yet" description="Create your first list." action={<PillButton size="sm">Create</PillButton>} />
              <EmptyState icon={Inbox} title="No tasks" description="Add a task." action={<PillButton size="sm">Add Task</PillButton>} />
              <EmptyState icon={Search} title="No results" description="Adjust your filters." action={<PillButton size="sm" variant="outline" showArrow={false}>Clear</PillButton>} />
            </div>
          </Section>

          <Separator />

          {/* ── LIST CARDS ── */}
          <Section title="List Cards" desc="Bento grid for task lists.">
            <BentoGrid>
              <BentoCard>
                <div className="flex items-start justify-between">
                  <div><h3 className="font-bold text-sm">Work Tasks</h3><p className="text-xs text-muted-foreground">12 tasks &middot; 3 overdue</p></div>
                  <ProgressRing value={67} size="sm" />
                </div>
                <Progress value={67} className="mt-3" />
                <p className="text-[0.6rem] text-muted-foreground mt-0.5">67% complete</p>
                <div className="mt-2 flex gap-1"><Badge variant="secondary">#work</Badge><Badge variant="secondary">#dev</Badge></div>
                <PillButton size="sm" className="mt-3">Open</PillButton>
              </BentoCard>
              <BentoCard>
                <div className="flex items-start justify-between">
                  <div><h3 className="font-bold text-sm">Personal</h3><p className="text-xs text-muted-foreground">8 tasks &middot; 0 overdue</p></div>
                  <ProgressRing value={80} size="sm" />
                </div>
                <Progress value={80} className="mt-3" />
                <p className="text-[0.6rem] text-muted-foreground mt-0.5">80% complete</p>
                <div className="mt-2 flex gap-1"><Badge variant="secondary">#home</Badge></div>
                <PillButton size="sm" className="mt-3">Open</PillButton>
              </BentoCard>
              <BentoCard interactive={false} className="border-dashed flex flex-col items-center justify-center text-center">
                <div className="rounded-full border border-border p-3 mb-2"><Plus className="size-5 text-muted-foreground" /></div>
                <h3 className="font-semibold text-sm">New List</h3>
                <p className="text-[0.6rem] text-muted-foreground mt-0.5">Organize tasks</p>
                <PillButton size="sm" variant="outline" className="mt-2">Create</PillButton>
              </BentoCard>
            </BentoGrid>
          </Section>

          {/* Footer */}
          <div className="border-t border-border pt-4 pb-2 text-center text-[0.6rem] text-muted-foreground">
            TodoApp Design System &middot; v0.1.0 &middot; Warm Coral Theme
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
