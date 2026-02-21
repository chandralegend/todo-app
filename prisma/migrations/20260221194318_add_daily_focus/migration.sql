-- CreateTable
CREATE TABLE "daily_focus" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_instance_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_focus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_focus_user_id_date_idx" ON "daily_focus"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_focus_user_id_task_instance_id_date_key" ON "daily_focus"("user_id", "task_instance_id", "date");

-- AddForeignKey
ALTER TABLE "daily_focus" ADD CONSTRAINT "daily_focus_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_focus" ADD CONSTRAINT "daily_focus_task_instance_id_fkey" FOREIGN KEY ("task_instance_id") REFERENCES "task_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
