-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Colombo',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "task_lists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "task_lists_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_list_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_list_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EDITOR',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "task_list_members_task_list_id_fkey" FOREIGN KEY ("task_list_id") REFERENCES "task_lists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_list_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_list_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "default_deadline_time" TEXT,
    "importance" TEXT NOT NULL DEFAULT 'MEDIUM',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "template_status" TEXT NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "recurrence_rule_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "task_templates_task_list_id_fkey" FOREIGN KEY ("task_list_id") REFERENCES "task_lists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_templates_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "task_templates_recurrence_rule_id_fkey" FOREIGN KEY ("recurrence_rule_id") REFERENCES "recurrence_rules" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recurrence_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "frequency" TEXT NOT NULL DEFAULT 'DAILY',
    "interval_value" INTEGER NOT NULL DEFAULT 1,
    "time_of_day" TEXT,
    "start_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" DATETIME,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Colombo',
    "days_of_week" TEXT NOT NULL DEFAULT '[]',
    "next_generation_cursor" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "task_instances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_template_id" TEXT NOT NULL,
    "task_list_id" TEXT NOT NULL,
    "occurrence_date" DATETIME NOT NULL,
    "scheduled_for" DATETIME,
    "deadline_at" DATETIME,
    "description_snapshot" TEXT NOT NULL,
    "importance_snapshot" TEXT NOT NULL,
    "tags_snapshot" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "failed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "completed_by_user_id" TEXT,
    "failed_by_user_id" TEXT,
    CONSTRAINT "task_instances_task_template_id_fkey" FOREIGN KEY ("task_template_id") REFERENCES "task_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_instances_task_list_id_fkey" FOREIGN KEY ("task_list_id") REFERENCES "task_lists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_instances_completed_by_user_id_fkey" FOREIGN KEY ("completed_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "task_instances_failed_by_user_id_fkey" FOREIGN KEY ("failed_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_focus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "task_instance_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_focus_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "daily_focus_task_instance_id_fkey" FOREIGN KEY ("task_instance_id") REFERENCES "task_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recurrence_run_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "templates_scanned" INTEGER NOT NULL DEFAULT 0,
    "attempted" INTEGER NOT NULL DEFAULT 0,
    "generated" INTEGER NOT NULL DEFAULT 0,
    "duplicate_or_existing" INTEGER NOT NULL DEFAULT 0,
    "window_start" DATETIME NOT NULL,
    "window_end" DATETIME NOT NULL,
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX "task_instances_task_list_id_created_at_idx" ON "task_instances"("task_list_id", "created_at");

-- CreateIndex
CREATE INDEX "task_instances_task_list_id_status_idx" ON "task_instances"("task_list_id", "status");

-- CreateIndex
CREATE INDEX "task_instances_task_list_id_importance_snapshot_idx" ON "task_instances"("task_list_id", "importance_snapshot");

-- CreateIndex
CREATE UNIQUE INDEX "task_instances_task_template_id_occurrence_date_key" ON "task_instances"("task_template_id", "occurrence_date");

-- CreateIndex
CREATE INDEX "daily_focus_user_id_date_idx" ON "daily_focus"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_focus_user_id_task_instance_id_date_key" ON "daily_focus"("user_id", "task_instance_id", "date");

-- CreateIndex
CREATE INDEX "recurrence_run_logs_created_at_idx" ON "recurrence_run_logs"("created_at");

-- CreateIndex
CREATE INDEX "recurrence_run_logs_status_idx" ON "recurrence_run_logs"("status");
