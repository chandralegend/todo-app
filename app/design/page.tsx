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
  Activity,
  Inbox,
  TrendingUp,
} from "lucide-react";

// shadcn base components
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Toggle,
} from "@/components/ui/toggle";

// Custom primitives
import { BentoCard, BentoGrid } from "@/components/ui/bento-card";
import { PillButton } from "@/components/ui/pill-button";
import { FilterChip, FilterChipGroup } from "@/components/ui/filter-chip";
import { CircularDate } from "@/components/ui/circular-date";
import { ProgressRing } from "@/components/ui/progress-ring";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImportanceBadge } from "@/components/ui/importance-badge";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";

// ────────────────────────────────────────────
// Section wrapper
// ────────────────────────────────────────────
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
    <section className="space-y-4">
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

function ColorSwatch({
  name,
  className,
  textClass = "text-white",
}: {
  name: string;
  className: string;
  textClass?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`h-16 w-16 rounded-xl border ${className} flex items-center justify-center`}
      >
        <span className={`text-[0.6rem] font-mono ${textClass}`}>Aa</span>
      </div>
      <span className="text-xs text-muted-foreground">{name}</span>
    </div>
  );
}

// ────────────────────────────────────────────
// Design page
// ────────────────────────────────────────────
export default function DesignPage() {
  const [chipFilters, setChipFilters] = useState([
    { label: "Status", value: "Todo" },
    { label: "Importance", value: "High" },
    { label: "Tag", value: "#work" },
  ]);

  const [togglePressed, setTogglePressed] = useState(false);

  const removeChip = (index: number) => {
    setChipFilters((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <h1 className="text-4xl font-bold tracking-tight">
              Design System
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              TodoApp UI component showcase — warm coral/terracotta theme
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl space-y-16 px-6 py-12">
          {/* ───── COLORS ───── */}
          <Section
            title="Color Palette"
            description="Warm coral/terracotta accent with neutral backgrounds and semantic status colors."
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Primary & Neutral
                </h3>
                <div className="flex flex-wrap gap-4">
                  <ColorSwatch name="Primary" className="bg-primary" />
                  <ColorSwatch
                    name="Primary FG"
                    className="bg-primary-foreground"
                    textClass="text-foreground"
                  />
                  <ColorSwatch
                    name="Background"
                    className="bg-background"
                    textClass="text-foreground"
                  />
                  <ColorSwatch
                    name="Card"
                    className="bg-card"
                    textClass="text-foreground"
                  />
                  <ColorSwatch
                    name="Muted"
                    className="bg-muted"
                    textClass="text-foreground"
                  />
                  <ColorSwatch
                    name="Accent"
                    className="bg-accent"
                    textClass="text-foreground"
                  />
                  <ColorSwatch
                    name="Secondary"
                    className="bg-secondary"
                    textClass="text-foreground"
                  />
                  <ColorSwatch name="Destructive" className="bg-destructive" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Custom Coral Tokens
                </h3>
                <div className="flex flex-wrap gap-4">
                  <ColorSwatch name="Coral" className="bg-coral" />
                  <ColorSwatch name="Coral Hover" className="bg-coral-hover" />
                  <ColorSwatch
                    name="Coral Light"
                    className="bg-coral-light"
                    textClass="text-foreground"
                  />
                  <ColorSwatch
                    name="Coral Muted"
                    className="bg-coral-muted"
                    textClass="text-white"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Status Colors
                </h3>
                <div className="flex flex-wrap gap-4">
                  <ColorSwatch name="Draft" className="bg-status-draft" />
                  <ColorSwatch name="Todo" className="bg-status-todo" />
                  <ColorSwatch
                    name="In Progress"
                    className="bg-status-in-progress"
                  />
                  <ColorSwatch
                    name="Completed"
                    className="bg-status-completed"
                  />
                  <ColorSwatch name="Failed" className="bg-status-failed" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Importance Colors
                </h3>
                <div className="flex flex-wrap gap-4">
                  <ColorSwatch name="Low" className="bg-importance-low" />
                  <ColorSwatch
                    name="Medium"
                    className="bg-importance-medium"
                  />
                  <ColorSwatch name="High" className="bg-importance-high" />
                  <ColorSwatch
                    name="Critical"
                    className="bg-importance-critical"
                  />
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ───── TYPOGRAPHY ───── */}
          <Section
            title="Typography"
            description="Outfit for headings, Geist Sans for body text."
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                Heading 1 — The quick brown fox
              </h1>
              <h2 className="text-3xl font-bold tracking-tight">
                Heading 2 — The quick brown fox
              </h2>
              <h3 className="text-2xl font-semibold">
                Heading 3 — The quick brown fox
              </h3>
              <h4 className="text-xl font-semibold">
                Heading 4 — The quick brown fox
              </h4>
              <p className="text-base text-foreground">
                Body text — The quick brown fox jumps over the lazy dog. This is
                regular paragraph text used throughout the application for
                descriptions and content.
              </p>
              <p className="text-sm text-muted-foreground">
                Muted text — Secondary information, timestamps, helper text, and
                labels appear in this style.
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Section Label — Small caps tracking wide
              </p>
              <p className="font-mono text-sm text-muted-foreground">
                Monospace — IDs, codes, technical values
              </p>
            </div>
          </Section>

          <Separator />

          {/* ───── BUTTONS ───── */}
          <Section
            title="Buttons"
            description="shadcn base buttons and custom pill buttons."
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  shadcn Button Variants
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Button Sizes
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <Plus />
                  </Button>
                  <Button size="icon-sm">
                    <Plus />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Pill Buttons (Custom)
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <PillButton variant="primary">Create Task</PillButton>
                  <PillButton variant="secondary">View All</PillButton>
                  <PillButton variant="outline">Filter</PillButton>
                  <PillButton variant="ghost" showArrow={false}>
                    Cancel
                  </PillButton>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Pill Button Sizes
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <PillButton size="sm">Small</PillButton>
                  <PillButton size="md">Medium</PillButton>
                  <PillButton size="lg">Large</PillButton>
                  <PillButton showArrow={false} size="sm" variant="outline">
                    No Arrow
                  </PillButton>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ───── BADGES ───── */}
          <Section
            title="Badges & Status Indicators"
            description="shadcn badges, status badges, and importance badges."
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  shadcn Badge Variants
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="ghost">Ghost</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Status Badges (Custom)
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status="DRAFT" />
                  <StatusBadge status="TODO" />
                  <StatusBadge status="IN_PROGRESS" />
                  <StatusBadge status="COMPLETED" />
                  <StatusBadge status="FAILED" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Importance Badges (Custom)
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <ImportanceBadge importance="LOW" />
                  <ImportanceBadge importance="MEDIUM" />
                  <ImportanceBadge importance="HIGH" />
                  <ImportanceBadge importance="CRITICAL" />
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ───── FILTER CHIPS ───── */}
          <Section
            title="Filter Chips"
            description="Dismissible filter tags for active filter display."
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Interactive (click X to remove)
                </h3>
                <FilterChipGroup>
                  {chipFilters.map((chip, i) => (
                    <FilterChip
                      key={`${chip.label}-${chip.value}`}
                      label={chip.label}
                      value={chip.value}
                      onRemove={() => removeChip(i)}
                    />
                  ))}
                  {chipFilters.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      No active filters —{" "}
                      <button
                        className="text-primary underline"
                        onClick={() =>
                          setChipFilters([
                            { label: "Status", value: "Todo" },
                            { label: "Importance", value: "High" },
                            { label: "Tag", value: "#work" },
                          ])
                        }
                      >
                        reset
                      </button>
                    </span>
                  )}
                </FilterChipGroup>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Static (no close button)
                </h3>
                <FilterChipGroup>
                  <FilterChip label="#work" />
                  <FilterChip label="#personal" />
                  <FilterChip label="#urgent" />
                  <FilterChip label="#meeting" />
                </FilterChipGroup>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ───── CIRCULAR DATE ───── */}
          <Section
            title="Circular Date"
            description="Round date display showing day and abbreviated month."
          >
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <CircularDate date={new Date()} />
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CircularDate date={new Date(2026, 1, 25)} />
                <span className="text-xs text-muted-foreground">Future</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CircularDate date={new Date(2026, 1, 15)} overdue />
                <span className="text-xs text-muted-foreground">Overdue</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CircularDate date={new Date(2026, 11, 25)} />
                <span className="text-xs text-muted-foreground">Dec 25</span>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ───── PROGRESS ───── */}
          <Section
            title="Progress Indicators"
            description="Circular rings and linear progress bars."
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Progress Rings (Custom)
                </h3>
                <div className="flex flex-wrap items-end gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <ProgressRing value={0} size="sm" />
                    <span className="text-xs text-muted-foreground">0%</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ProgressRing value={25} size="sm" />
                    <span className="text-xs text-muted-foreground">25%</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ProgressRing value={50} size="md" />
                    <span className="text-xs text-muted-foreground">50%</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ProgressRing value={75} size="md" />
                    <span className="text-xs text-muted-foreground">75%</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ProgressRing value={100} size="lg" />
                    <span className="text-xs text-muted-foreground">100%</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Linear Progress (shadcn)
                </h3>
                <div className="space-y-3 max-w-lg">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0% complete</span>
                      <span>0/12</span>
                    </div>
                    <Progress value={0} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>40% complete</span>
                      <span>5/12</span>
                    </div>
                    <Progress value={40} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>67% complete</span>
                      <span>8/12</span>
                    </div>
                    <Progress value={67} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>100% complete</span>
                      <span>12/12</span>
                    </div>
                    <Progress value={100} />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ───── STAT CARDS ───── */}
          <Section
            title="Stat Cards"
            description="Summary metric cards for dashboard overview."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Today"
                value={5}
                description="tasks due today"
                icon={Calendar}
              />
              <StatCard
                label="Overdue"
                value={2}
                description="tasks past deadline"
                icon={AlertTriangle}
              />
              <StatCard
                label="In Progress"
                value={3}
                description="tasks active now"
                icon={TrendingUp}
              />
              <StatCard
                label="Completed"
                value={12}
                description="this week"
                icon={CheckCircle2}
              />
            </div>
          </Section>

          <Separator />

          {/* ───── BENTO CARDS ───── */}
          <Section
            title="Bento Cards"
            description="Ring-bordered cards for bento grid layouts."
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  List Cards (Bento Grid)
                </h3>
                <BentoGrid className="lg:grid-cols-3">
                  <BentoCard>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Work Tasks</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          12 tasks &middot; 3 overdue
                        </p>
                      </div>
                      <ProgressRing value={67} size="sm" />
                    </div>
                    <div className="mt-4">
                      <Progress value={67} />
                      <p className="text-xs text-muted-foreground mt-1">
                        67% complete
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant="secondary">#work</Badge>
                      <Badge variant="secondary">#dev</Badge>
                      <Badge variant="secondary">#urgent</Badge>
                    </div>
                    <div className="mt-4">
                      <PillButton size="sm">Open</PillButton>
                    </div>
                  </BentoCard>

                  <BentoCard>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Personal</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          8 tasks &middot; 1 overdue
                        </p>
                      </div>
                      <ProgressRing value={80} size="sm" />
                    </div>
                    <div className="mt-4">
                      <Progress value={80} />
                      <p className="text-xs text-muted-foreground mt-1">
                        80% complete
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant="secondary">#home</Badge>
                      <Badge variant="secondary">#health</Badge>
                    </div>
                    <div className="mt-4">
                      <PillButton size="sm">Open</PillButton>
                    </div>
                  </BentoCard>

                  <BentoCard
                    interactive={false}
                    className="border-dashed flex flex-col items-center justify-center text-center"
                  >
                    <div className="rounded-2xl bg-muted p-3 mb-3">
                      <Plus className="size-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold">New List</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a new list to organize your tasks
                    </p>
                    <div className="mt-4">
                      <PillButton size="sm" variant="outline">
                        Create
                      </PillButton>
                    </div>
                  </BentoCard>
                </BentoGrid>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Accent Variants
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <BentoCard accent="coral">
                    <h4 className="font-semibold">Coral Accent</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Left border accent in coral
                    </p>
                  </BentoCard>
                  <BentoCard accent="destructive">
                    <h4 className="font-semibold">Destructive Accent</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Used for overdue task cards
                    </p>
                  </BentoCard>
                  <BentoCard accent="success">
                    <h4 className="font-semibold">Success Accent</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Used for completed items
                    </p>
                  </BentoCard>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ───── TASK CARD PREVIEW ───── */}
          <Section
            title="Task Card Preview"
            description="How task cards will look in the list view."
          >
            <div className="max-w-2xl space-y-3">
              {/* Normal task */}
              <BentoCard className="flex items-start gap-4 p-4">
                <CircularDate date={new Date(2026, 1, 22)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium">Review PR #234</h4>
                    <ImportanceBadge importance="HIGH" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Due tomorrow
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">#code</Badge>
                    <Badge variant="secondary">#urgent</Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      <StatusBadge status="TODO" />
                    </span>
                  </div>
                </div>
              </BentoCard>

              {/* Overdue task */}
              <BentoCard accent="destructive" className="flex items-start gap-4 p-4">
                <CircularDate date={new Date(2026, 1, 18)} overdue />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium">Fix login bug</h4>
                    <ImportanceBadge importance="CRITICAL" />
                  </div>
                  <p className="text-sm text-destructive font-medium mt-0.5">
                    Overdue by 3 days
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">#bug</Badge>
                    <Badge variant="secondary">#urgent</Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      <StatusBadge status="IN_PROGRESS" />
                    </span>
                  </div>
                </div>
              </BentoCard>

              {/* Completed task */}
              <BentoCard accent="success" className="flex items-start gap-4 p-4 opacity-75">
                <CircularDate date={new Date(2026, 1, 20)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium line-through text-muted-foreground">
                      Write documentation
                    </h4>
                    <ImportanceBadge importance="MEDIUM" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Completed 2 days ago
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">#docs</Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      <StatusBadge status="COMPLETED" />
                    </span>
                  </div>
                </div>
              </BentoCard>
            </div>
          </Section>

          <Separator />

          {/* ───── FORM ELEMENTS ───── */}
          <Section
            title="Form Elements"
            description="Inputs, textareas, checkboxes, and toggles."
          >
            <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
              <div className="space-y-2">
                <label className="text-sm font-medium">Text Input</label>
                <Input placeholder="Enter task description..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Input</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input placeholder="Search tasks..." className="pl-9" />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Textarea</label>
                <Textarea
                  placeholder="Describe the task in detail..."
                  rows={3}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">Checkboxes</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="c1" />
                    <label htmlFor="c1" className="text-sm">
                      Unchecked item
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="c2" defaultChecked />
                    <label htmlFor="c2" className="text-sm">
                      Checked item
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">Toggle</label>
                <div className="flex items-center gap-2">
                  <Toggle
                    pressed={togglePressed}
                    onPressedChange={setTogglePressed}
                    aria-label="Toggle recurring"
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    {togglePressed ? "Recurring ON" : "Recurring OFF"}
                  </Toggle>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ───── AVATARS ───── */}
          <Section
            title="Avatars"
            description="User avatars with initials fallback."
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  JD
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-coral-light text-coral text-sm font-medium">
                  AB
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-muted text-foreground font-medium">
                  CD
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  U
                </AvatarFallback>
              </Avatar>
            </div>
          </Section>

          <Separator />

          {/* ───── TABS ───── */}
          <Section
            title="Tabs"
            description="Tab navigation for quick filtering and view switching."
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Default Variant
                </h3>
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">
                    <p className="text-sm text-muted-foreground p-4">
                      Showing all tasks...
                    </p>
                  </TabsContent>
                  <TabsContent value="today">
                    <p className="text-sm text-muted-foreground p-4">
                      Showing today&apos;s tasks...
                    </p>
                  </TabsContent>
                  <TabsContent value="overdue">
                    <p className="text-sm text-muted-foreground p-4">
                      Showing overdue tasks...
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Line Variant
                </h3>
                <Tabs defaultValue="tasks">
                  <TabsList variant="line">
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tasks">
                    <p className="text-sm text-muted-foreground p-4">
                      Task content here...
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ───── DIALOGS & SHEETS ───── */}
          <Section
            title="Dialogs, Sheets & Alerts"
            description="Modal overlays for task creation, detail panels, and confirmations."
          >
            <div className="flex flex-wrap items-center gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Task</DialogTitle>
                    <DialogDescription>
                      Add a task to your list. Fill in the details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Description
                      </label>
                      <Textarea
                        placeholder="What needs to be done?"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Deadline</label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Importance
                        </label>
                        <Input placeholder="Medium" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline">Cancel</Button>
                      <PillButton>Create Task</PillButton>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Task Details</SheetTitle>
                    <SheetDescription>
                      View and manage task information.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 p-4">
                    <div>
                      <h3 className="text-lg font-semibold">Review PR #234</h3>
                      <StatusBadge status="IN_PROGRESS" className="mt-2" />
                    </div>
                    <Separator />
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deadline</span>
                        <span>Feb 22, 2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Importance
                        </span>
                        <ImportanceBadge importance="HIGH" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tags</span>
                        <div className="flex gap-1">
                          <Badge variant="secondary">#code</Badge>
                          <Badge variant="secondary">#urgent</Badge>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <Button className="w-full">
                        <Edit className="mr-2 size-4" /> Edit Task
                      </Button>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 size-4" /> Delete Task
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Alert</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The task and all its
                      instances will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Clock />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This is a tooltip</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Section>

          <Separator />

          {/* ───── CARDS ───── */}
          <Section
            title="shadcn Cards"
            description="Standard card component from shadcn."
          >
            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>
                    This is a standard shadcn card component.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Card content goes here. Can contain any elements.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-4 text-primary" />
                    With Icon
                  </CardTitle>
                  <CardDescription>Card with an icon in header.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={60} />
                    <p className="text-xs text-muted-foreground">
                      60% complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Separator />

          {/* ───── SKELETONS ───── */}
          <Section
            title="Skeleton Loaders"
            description="Loading placeholders for content."
          >
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Task Card Skeleton
                </h3>
                <div className="rounded-2xl border p-4 flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-2 mt-3">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Stat Card Skeleton
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border p-5 space-y-3">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-8 w-12" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ───── EMPTY STATES ───── */}
          <Section
            title="Empty States"
            description="Placeholder displays when no content is available."
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <EmptyState
                icon={ListTodo}
                title="No lists yet"
                description="Create your first list to get started organizing your tasks."
                action={<PillButton size="sm">Create List</PillButton>}
              />
              <EmptyState
                icon={Inbox}
                title="No tasks yet"
                description="Add a task to get started with this list."
                action={<PillButton size="sm">Add Task</PillButton>}
              />
              <EmptyState
                icon={Search}
                title="No results"
                description="No tasks match your current filters. Try adjusting them."
                action={
                  <PillButton size="sm" variant="outline" showArrow={false}>
                    Clear Filters
                  </PillButton>
                }
              />
            </div>
          </Section>

          <Separator />

          {/* ───── COMPOSITE: DASHBOARD PREVIEW ───── */}
          <Section
            title="Dashboard Preview"
            description="Composite layout showing how components work together."
          >
            <div className="rounded-2xl border bg-card p-6 space-y-6">
              {/* Greeting */}
              <div>
                <h2 className="text-2xl font-bold">Good morning, John</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Here&apos;s your overview for today
                </p>
              </div>

              {/* Stats row */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Today"
                  value={5}
                  description="tasks due"
                  icon={Calendar}
                />
                <StatCard
                  label="Overdue"
                  value={2}
                  description="past deadline"
                  icon={AlertTriangle}
                />
                <StatCard
                  label="In Progress"
                  value={3}
                  description="active"
                  icon={Activity}
                />
                <StatCard
                  label="Done This Week"
                  value={12}
                  description="completed"
                  icon={CheckCircle2}
                />
              </div>

              {/* Lists header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">My Lists</h3>
                <PillButton size="sm" variant="outline">
                  View All
                </PillButton>
              </div>

              {/* List cards */}
              <BentoGrid className="lg:grid-cols-3">
                <BentoCard>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">Work Tasks</h4>
                      <p className="text-sm text-muted-foreground">
                        12 tasks &middot; 3 overdue
                      </p>
                    </div>
                    <ProgressRing value={67} size="sm" />
                  </div>
                  <Progress value={67} className="mt-3" />
                  <div className="mt-3 flex gap-1.5">
                    <Badge variant="secondary">#work</Badge>
                    <Badge variant="secondary">#dev</Badge>
                  </div>
                  <div className="mt-3">
                    <PillButton size="sm">
                      Open
                    </PillButton>
                  </div>
                </BentoCard>

                <BentoCard>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">Personal</h4>
                      <p className="text-sm text-muted-foreground">
                        8 tasks &middot; 0 overdue
                      </p>
                    </div>
                    <ProgressRing value={80} size="sm" />
                  </div>
                  <Progress value={80} className="mt-3" />
                  <div className="mt-3 flex gap-1.5">
                    <Badge variant="secondary">#home</Badge>
                  </div>
                  <div className="mt-3">
                    <PillButton size="sm">
                      Open
                    </PillButton>
                  </div>
                </BentoCard>

                <BentoCard
                  interactive={false}
                  className="border-dashed flex flex-col items-center justify-center text-center"
                >
                  <Plus className="size-8 text-muted-foreground mb-2" />
                  <h4 className="font-semibold">New List</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Organize your tasks
                  </p>
                  <PillButton size="sm" variant="outline" className="mt-3">
                    Create
                  </PillButton>
                </BentoCard>
              </BentoGrid>
            </div>
          </Section>

          {/* Footer */}
          <div className="border-t pt-8 pb-4 text-center text-xs text-muted-foreground">
            TodoApp Design System &middot; v0.1.0 &middot; Warm Coral Theme
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
