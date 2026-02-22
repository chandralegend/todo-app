import { Importance, RecurrenceFrequency } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseDaysOfWeek } from "@/lib/array-fields";

/** Raw shape from Prisma (daysOfWeek and tags are JSON strings in SQLite) */
type RecurrenceRuleLike = {
  frequency: RecurrenceFrequency;
  intervalValue: number;
  startDate: Date;
  endDate: Date | null;
  daysOfWeek: string;
  timeOfDay: string | null;
};

type RecurringTemplate = {
  id: string;
  taskListId: string;
  description: string;
  importance: Importance;
  tags: string;
  defaultDeadlineTime: string | null;
  recurrenceRule: RecurrenceRuleLike;
};

function startOfDayUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDaysUtc(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function diffDaysUtc(a: Date, b: Date): number {
  const start = startOfDayUtc(a).getTime();
  const end = startOfDayUtc(b).getTime();
  return Math.floor((end - start) / (24 * 60 * 60 * 1000));
}

function diffMonthsUtc(a: Date, b: Date): number {
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
}

function parseTimeOnDateUtc(date: Date, time: string | null): Date | null {
  if (!time) {
    return null;
  }

  const [hourPart, minutePart] = time.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  const parsed = new Date(date);
  parsed.setUTCHours(hour, minute, 0, 0);
  return parsed;
}

function matchesRuleOnDate(date: Date, rule: RecurrenceRuleLike): boolean {
  const day = startOfDayUtc(date);
  const start = startOfDayUtc(rule.startDate);
  const end = rule.endDate ? startOfDayUtc(rule.endDate) : null;

  if (day < start) {
    return false;
  }
  if (end && day > end) {
    return false;
  }

  const interval = Math.max(1, rule.intervalValue);
  const diffDays = diffDaysUtc(start, day);

  if (rule.frequency === "DAILY" || rule.frequency === "CUSTOM") {
    return diffDays % interval === 0;
  }

  if (rule.frequency === "WEEKLY") {
    const startWeek = startOfDayUtc(start);
    const dayWeek = startOfDayUtc(day);
    const diffWeeks = Math.floor(diffDaysUtc(startWeek, dayWeek) / 7);
    if (diffWeeks % interval !== 0) {
      return false;
    }

    const days = parseDaysOfWeek(rule.daysOfWeek);
    const allowedWeekdays = days.length > 0 ? days : [start.getUTCDay()];
    return allowedWeekdays.includes(day.getUTCDay());
  }

  if (rule.frequency === "MONTHLY") {
    const diffMonths = diffMonthsUtc(start, day);
    if (diffMonths < 0 || diffMonths % interval !== 0) {
      return false;
    }
    return day.getUTCDate() === start.getUTCDate();
  }

  return false;
}

function computeOccurrenceDates(rule: RecurrenceRuleLike, windowStart: Date, windowEnd: Date): Date[] {
  const start = startOfDayUtc(windowStart);
  const end = startOfDayUtc(windowEnd);
  const dates: Date[] = [];

  for (let current = start; current <= end; current = addDaysUtc(current, 1)) {
    if (matchesRuleOnDate(current, rule)) {
      dates.push(new Date(current));
    }
  }

  return dates;
}

export async function generateRecurringInstances(args?: {
  windowStart?: Date;
  windowEnd?: Date;
}) {
  const now = new Date();
  const windowStart = args?.windowStart ?? addDaysUtc(startOfDayUtc(now), -2);
  const windowEnd = args?.windowEnd ?? addDaysUtc(startOfDayUtc(now), 14);

  const templates = (await prisma.taskTemplate.findMany({
    where: {
      isRecurring: true,
      isActive: true,
      recurrenceRuleId: { not: null },
      taskList: { isArchived: false },
    },
    select: {
      id: true,
      taskListId: true,
      description: true,
      importance: true,
      tags: true,
      defaultDeadlineTime: true,
      recurrenceRule: {
        select: {
          frequency: true,
          intervalValue: true,
          startDate: true,
          endDate: true,
          daysOfWeek: true,
          timeOfDay: true,
        },
      },
    },
  })) as RecurringTemplate[];

  let generated = 0;
  let attempted = 0;

  for (const template of templates) {
    if (!template.recurrenceRule) {
      continue;
    }

    const occurrences = computeOccurrenceDates(template.recurrenceRule, windowStart, windowEnd);

    if (occurrences.length === 0) {
      continue;
    }

    attempted += occurrences.length;

    const rows = occurrences.map((occurrenceDate) => ({
      taskTemplateId: template.id,
      taskListId: template.taskListId,
      occurrenceDate,
      scheduledFor: parseTimeOnDateUtc(occurrenceDate, template.recurrenceRule.timeOfDay),
      deadlineAt: parseTimeOnDateUtc(occurrenceDate, template.defaultDeadlineTime),
      descriptionSnapshot: template.description,
      importanceSnapshot: template.importance,
      tagsSnapshot: template.tags,
      status: "TODO" as const,
    }));

    // SQLite doesn't support skipDuplicates — insert one-by-one, catching unique constraint errors
    for (const row of rows) {
      try {
        await prisma.taskInstance.create({ data: row });
        generated++;
      } catch {
        // Duplicate (unique constraint on [taskTemplateId, occurrenceDate]) — skip
      }
    }
  }

  return {
    templatesScanned: templates.length,
    attempted,
    generated,
    duplicateOrExisting: attempted - generated,
    windowStart,
    windowEnd,
  };
}
