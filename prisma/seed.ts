import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning database...");

  // Delete in order to respect FK constraints
  await prisma.taskInstance.deleteMany();
  await prisma.taskTemplate.deleteMany();
  await prisma.recurrenceRule.deleteMany();
  await prisma.taskListMember.deleteMany();
  await prisma.taskList.deleteMany();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).recurrenceRunLog.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleaned.");

  // ── Users ──
  const passwordHash = await hash("password123", 12);

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      username: "alice",
      displayName: "Alice Johnson",
      passwordHash,
    },
  });

  console.log(`Created user: ${alice.displayName} (${alice.email})`);

  // ── Helper: create list with tasks ──
  async function createListWithTasks(
    name: string,
    description: string,
    tasks: {
      desc: string;
      importance: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      status: "DRAFT" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
      tags: string[];
      deadlineDaysFromNow?: number | null;
    }[]
  ) {
    const list = await prisma.taskList.create({
      data: {
        ownerUserId: alice.id,
        name,
        description,
        members: {
          create: { userId: alice.id, role: "OWNER" },
        },
      },
    });

    const now = new Date();

    for (const t of tasks) {
      const deadline =
        t.deadlineDaysFromNow != null
          ? new Date(now.getTime() + t.deadlineDaysFromNow * 86400000)
          : null;

      const template = await prisma.taskTemplate.create({
        data: {
          taskListId: list.id,
          createdByUserId: alice.id,
          description: t.desc,
          importance: t.importance,
          templateStatus: t.status,
          tags: t.tags,
        },
      });

      const completedAt =
        t.status === "COMPLETED" ? new Date(now.getTime() - Math.random() * 5 * 86400000) : null;
      const startedAt =
        t.status === "IN_PROGRESS" ? new Date(now.getTime() - Math.random() * 3 * 86400000) : null;

      await prisma.taskInstance.create({
        data: {
          taskTemplateId: template.id,
          taskListId: list.id,
          occurrenceDate: now,
          deadlineAt: deadline,
          descriptionSnapshot: t.desc,
          importanceSnapshot: t.importance,
          tagsSnapshot: t.tags,
          status: t.status,
          startedAt,
          completedAt,
          completedByUserId: t.status === "COMPLETED" ? alice.id : null,
        },
      });
    }

    console.log(`Created list: "${name}" with ${tasks.length} tasks`);
    return list;
  }

  // ── List 1: Work Projects ──
  await createListWithTasks("Work Projects", "Sprint tasks and deliverables", [
    { desc: "Finalize Q1 report with revenue breakdowns", importance: "HIGH", status: "IN_PROGRESS", tags: ["reports", "q1"], deadlineDaysFromNow: 2 },
    { desc: "Review PR #347 - auth refactor", importance: "HIGH", status: "TODO", tags: ["code-review", "auth"], deadlineDaysFromNow: 1 },
    { desc: "Update API documentation for v2 endpoints", importance: "MEDIUM", status: "TODO", tags: ["docs", "api"], deadlineDaysFromNow: 5 },
    { desc: "Fix pagination bug on /users endpoint", importance: "CRITICAL", status: "IN_PROGRESS", tags: ["bug", "api"], deadlineDaysFromNow: 0 },
    { desc: "Set up staging environment for client demo", importance: "HIGH", status: "TODO", tags: ["devops", "demo"], deadlineDaysFromNow: 3 },
    { desc: "Write unit tests for payment module", importance: "MEDIUM", status: "DRAFT", tags: ["testing", "payments"], deadlineDaysFromNow: 7 },
    { desc: "Deploy monitoring dashboard", importance: "MEDIUM", status: "COMPLETED", tags: ["devops", "monitoring"], deadlineDaysFromNow: null },
    { desc: "Migrate database to new cluster", importance: "HIGH", status: "COMPLETED", tags: ["devops", "database"], deadlineDaysFromNow: null },
    { desc: "Conduct code review session with junior devs", importance: "LOW", status: "TODO", tags: ["mentoring"], deadlineDaysFromNow: 4 },
    { desc: "Optimize image compression pipeline", importance: "MEDIUM", status: "TODO", tags: ["performance", "media"], deadlineDaysFromNow: 10 },
    { desc: "Update CI/CD pipeline for monorepo", importance: "HIGH", status: "FAILED", tags: ["devops", "ci"], deadlineDaysFromNow: -2 },
    { desc: "Prepare sprint retrospective notes", importance: "LOW", status: "COMPLETED", tags: ["agile"], deadlineDaysFromNow: null },
  ]);

  // ── List 2: Personal Errands ──
  await createListWithTasks("Personal Errands", "Day-to-day tasks and errands", [
    { desc: "Grocery shopping - weekly essentials", importance: "MEDIUM", status: "TODO", tags: ["shopping"], deadlineDaysFromNow: 1 },
    { desc: "Schedule dentist appointment", importance: "HIGH", status: "TODO", tags: ["health"], deadlineDaysFromNow: 3 },
    { desc: "Pick up dry cleaning", importance: "LOW", status: "COMPLETED", tags: ["errands"], deadlineDaysFromNow: null },
    { desc: "Renew gym membership", importance: "MEDIUM", status: "TODO", tags: ["health", "fitness"], deadlineDaysFromNow: 7 },
    { desc: "Call electrician for kitchen light", importance: "HIGH", status: "IN_PROGRESS", tags: ["home"], deadlineDaysFromNow: 2 },
    { desc: "Order birthday gift for Mom", importance: "CRITICAL", status: "TODO", tags: ["family", "shopping"], deadlineDaysFromNow: 4 },
    { desc: "Return Amazon package", importance: "LOW", status: "TODO", tags: ["errands", "shopping"], deadlineDaysFromNow: 5 },
    { desc: "Pay electricity bill", importance: "HIGH", status: "COMPLETED", tags: ["bills"], deadlineDaysFromNow: null },
  ]);

  // ── List 3: Learning & Development ──
  await createListWithTasks("Learning & Development", "Courses, books, and skill-building", [
    { desc: "Complete React Server Components tutorial", importance: "HIGH", status: "IN_PROGRESS", tags: ["react", "learning"], deadlineDaysFromNow: 5 },
    { desc: "Read 'Designing Data-Intensive Applications' Ch. 5-7", importance: "MEDIUM", status: "TODO", tags: ["books", "systems"], deadlineDaysFromNow: 14 },
    { desc: "Practice LeetCode - dynamic programming set", importance: "MEDIUM", status: "TODO", tags: ["algorithms", "practice"], deadlineDaysFromNow: 7 },
    { desc: "Watch AWS re:Invent keynote recording", importance: "LOW", status: "TODO", tags: ["aws", "cloud"], deadlineDaysFromNow: 10 },
    { desc: "Build a CLI tool in Rust (side project)", importance: "LOW", status: "DRAFT", tags: ["rust", "side-project"], deadlineDaysFromNow: null },
    { desc: "Finish TypeScript advanced patterns course", importance: "HIGH", status: "COMPLETED", tags: ["typescript", "learning"], deadlineDaysFromNow: null },
    { desc: "Write blog post about Next.js App Router patterns", importance: "MEDIUM", status: "TODO", tags: ["writing", "nextjs"], deadlineDaysFromNow: 12 },
    { desc: "Contribute to open source - fix issue #892", importance: "MEDIUM", status: "TODO", tags: ["open-source", "github"], deadlineDaysFromNow: 8 },
    { desc: "Set up home lab Kubernetes cluster", importance: "LOW", status: "DRAFT", tags: ["k8s", "homelab"], deadlineDaysFromNow: null },
  ]);

  // ── List 4: Home Renovation ──
  await createListWithTasks("Home Renovation", "Kitchen and bathroom remodel tracking", [
    { desc: "Get 3 quotes from contractors", importance: "HIGH", status: "COMPLETED", tags: ["planning", "quotes"], deadlineDaysFromNow: null },
    { desc: "Choose kitchen countertop material", importance: "HIGH", status: "IN_PROGRESS", tags: ["kitchen", "materials"], deadlineDaysFromNow: 3 },
    { desc: "Order bathroom tiles from supplier", importance: "MEDIUM", status: "TODO", tags: ["bathroom", "materials"], deadlineDaysFromNow: 7 },
    { desc: "Apply for building permit", importance: "CRITICAL", status: "TODO", tags: ["permits", "legal"], deadlineDaysFromNow: 2 },
    { desc: "Schedule plumber for rough-in work", importance: "HIGH", status: "TODO", tags: ["plumbing"], deadlineDaysFromNow: 14 },
    { desc: "Paint bedroom accent wall", importance: "LOW", status: "COMPLETED", tags: ["painting", "bedroom"], deadlineDaysFromNow: null },
    { desc: "Research smart home lighting options", importance: "LOW", status: "TODO", tags: ["smart-home", "lighting"], deadlineDaysFromNow: 21 },
  ]);

  // ── List 5: Fitness Goals ──
  await createListWithTasks("Fitness Goals", "Training plan and health targets for 2026", [
    { desc: "Run 5K under 25 minutes", importance: "HIGH", status: "IN_PROGRESS", tags: ["running", "cardio"], deadlineDaysFromNow: 30 },
    { desc: "Complete 30-day yoga challenge", importance: "MEDIUM", status: "IN_PROGRESS", tags: ["yoga", "flexibility"], deadlineDaysFromNow: 15 },
    { desc: "Meal prep Sunday batch cooking", importance: "MEDIUM", status: "TODO", tags: ["nutrition", "meal-prep"], deadlineDaysFromNow: 2 },
    { desc: "Book sports massage appointment", importance: "LOW", status: "TODO", tags: ["recovery"], deadlineDaysFromNow: 5 },
    { desc: "Buy new running shoes", importance: "MEDIUM", status: "COMPLETED", tags: ["gear", "shopping"], deadlineDaysFromNow: null },
    { desc: "Track macros for 7 consecutive days", importance: "HIGH", status: "TODO", tags: ["nutrition", "tracking"], deadlineDaysFromNow: 7 },
  ]);

  console.log("\nSeed complete!");
  console.log("Login: alice@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
