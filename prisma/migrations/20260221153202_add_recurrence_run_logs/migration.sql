-- CreateEnum
CREATE TYPE "RecurrenceRunStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "recurrence_run_logs" (
    "id" TEXT NOT NULL,
    "status" "RecurrenceRunStatus" NOT NULL,
    "templates_scanned" INTEGER NOT NULL DEFAULT 0,
    "attempted" INTEGER NOT NULL DEFAULT 0,
    "generated" INTEGER NOT NULL DEFAULT 0,
    "duplicate_or_existing" INTEGER NOT NULL DEFAULT 0,
    "window_start" TIMESTAMP(3) NOT NULL,
    "window_end" TIMESTAMP(3) NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurrence_run_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurrence_run_logs_created_at_idx" ON "recurrence_run_logs"("created_at");

-- CreateIndex
CREATE INDEX "recurrence_run_logs_status_idx" ON "recurrence_run_logs"("status");
