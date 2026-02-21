-- CreateIndex
CREATE INDEX "task_instances_task_list_id_created_at_idx" ON "task_instances"("task_list_id", "created_at");

-- CreateIndex
CREATE INDEX "task_instances_task_list_id_status_idx" ON "task_instances"("task_list_id", "status");

-- CreateIndex
CREATE INDEX "task_instances_task_list_id_importance_snapshot_idx" ON "task_instances"("task_list_id", "importance_snapshot");
