-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('DRAFT', 'TODO', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "Importance" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Colombo',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_lists" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_list_members" (
    "id" TEXT NOT NULL,
    "task_list_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_list_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_templates" (
    "id" TEXT NOT NULL,
    "task_list_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "default_deadline_time" TEXT,
    "importance" "Importance" NOT NULL DEFAULT 'MEDIUM',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "template_status" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recurrence_rule_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurrence_rules" (
    "id" TEXT NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL DEFAULT 'DAILY',
    "interval_value" INTEGER NOT NULL DEFAULT 1,
    "time_of_day" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Colombo',
    "days_of_week" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "next_generation_cursor" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurrence_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_instances" (
    "id" TEXT NOT NULL,
    "task_template_id" TEXT NOT NULL,
    "task_list_id" TEXT NOT NULL,
    "occurrence_date" TIMESTAMP(3) NOT NULL,
    "scheduled_for" TIMESTAMP(3),
    "deadline_at" TIMESTAMP(3),
    "description_snapshot" TEXT NOT NULL,
    "importance_snapshot" "Importance" NOT NULL,
    "tags_snapshot" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_by_user_id" TEXT,
    "failed_by_user_id" TEXT,

    CONSTRAINT "task_instances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "task_lists_owner_user_id_idx" ON "task_lists"("owner_user_id");

-- CreateIndex
CREATE INDEX "task_lists_is_archived_idx" ON "task_lists"("is_archived");

-- CreateIndex
CREATE INDEX "task_list_members_task_list_id_idx" ON "task_list_members"("task_list_id");

-- CreateIndex
CREATE INDEX "task_list_members_user_id_idx" ON "task_list_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_list_members_task_list_id_user_id_key" ON "task_list_members"("task_list_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_templates_recurrence_rule_id_key" ON "task_templates"("recurrence_rule_id");

-- CreateIndex
CREATE INDEX "task_templates_task_list_id_idx" ON "task_templates"("task_list_id");

-- CreateIndex
CREATE INDEX "task_templates_created_by_user_id_idx" ON "task_templates"("created_by_user_id");

-- CreateIndex
CREATE INDEX "task_templates_is_active_idx" ON "task_templates"("is_active");

-- CreateIndex
CREATE INDEX "task_templates_is_recurring_idx" ON "task_templates"("is_recurring");

-- CreateIndex
CREATE INDEX "task_instances_task_list_id_idx" ON "task_instances"("task_list_id");

-- CreateIndex
CREATE INDEX "task_instances_status_idx" ON "task_instances"("status");

-- CreateIndex
CREATE INDEX "task_instances_deadline_at_idx" ON "task_instances"("deadline_at");

-- CreateIndex
CREATE INDEX "task_instances_occurrence_date_idx" ON "task_instances"("occurrence_date");

-- CreateIndex
CREATE UNIQUE INDEX "task_instances_task_template_id_occurrence_date_key" ON "task_instances"("task_template_id", "occurrence_date");

-- AddForeignKey
ALTER TABLE "task_lists" ADD CONSTRAINT "task_lists_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_list_members" ADD CONSTRAINT "task_list_members_task_list_id_fkey" FOREIGN KEY ("task_list_id") REFERENCES "task_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_list_members" ADD CONSTRAINT "task_list_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_templates" ADD CONSTRAINT "task_templates_task_list_id_fkey" FOREIGN KEY ("task_list_id") REFERENCES "task_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_templates" ADD CONSTRAINT "task_templates_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_templates" ADD CONSTRAINT "task_templates_recurrence_rule_id_fkey" FOREIGN KEY ("recurrence_rule_id") REFERENCES "recurrence_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_instances" ADD CONSTRAINT "task_instances_task_template_id_fkey" FOREIGN KEY ("task_template_id") REFERENCES "task_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_instances" ADD CONSTRAINT "task_instances_task_list_id_fkey" FOREIGN KEY ("task_list_id") REFERENCES "task_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_instances" ADD CONSTRAINT "task_instances_completed_by_user_id_fkey" FOREIGN KEY ("completed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_instances" ADD CONSTRAINT "task_instances_failed_by_user_id_fkey" FOREIGN KEY ("failed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
