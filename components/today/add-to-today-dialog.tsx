"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImportanceBadge } from "@/components/ui/importance-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search } from "lucide-react";
import type { TaskStatus, Importance } from "@prisma/client";
import { toast } from "sonner";

export interface AvailableTask {
  id: string;
  description: string;
  status: string;
  importance: string;
  deadline: string | null;
  tags: string[];
  listName: string;
  listId: string;
}

interface AddToTodayDialogProps {
  tasks: AvailableTask[];
  addToFocusAction: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
}

export function AddToTodayDialog({
  tasks,
  addToFocusAction,
  children,
}: AddToTodayDialogProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.listName.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [tasks, search]);

  function toggleTask(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((t) => t.id)));
    }
  }

  async function handleSubmit() {
    if (selected.size === 0) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("taskIds", Array.from(selected).join(","));
      await addToFocusAction(fd);
      toast.success(`Added ${selected.size} task(s) to today's focus`);
      setSelected(new Set());
      setSearch("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setSelected(new Set());
          setSearch("");
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-3">
          <DialogTitle className="text-sm">Add Tasks to Today</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs rounded-full"
            />
          </div>
        </div>

        {/* Select all bar */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 pb-2">
            <button
              onClick={selectAll}
              className="text-[0.65rem] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {selected.size === filtered.length
                ? "Deselect all"
                : `Select all (${filtered.length})`}
            </button>
            {selected.size > 0 && (
              <span className="text-[0.65rem] text-primary font-medium">
                {selected.size} selected
              </span>
            )}
          </div>
        )}

        {/* Task list */}
        <ScrollArea className="max-h-[360px] border-t border-border">
          <div className="p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                {tasks.length === 0
                  ? "No pending tasks available"
                  : "No tasks match your search"}
              </div>
            ) : (
              filtered.map((task) => (
                <div
                  key={task.id}
                  role="option"
                  aria-selected={selected.has(task.id)}
                  onClick={() => toggleTask(task.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleTask(task.id);
                    }
                  }}
                  tabIndex={0}
                  className={`w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                    selected.has(task.id)
                      ? "bg-primary/5 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <Checkbox
                    checked={selected.has(task.id)}
                    className="mt-0.5 pointer-events-none"
                    tabIndex={-1}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug">{task.description}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="text-[0.6rem] py-0"
                      >
                        {task.listName}
                      </Badge>
                      <StatusBadge status={task.status as TaskStatus} />
                      <ImportanceBadge
                        importance={task.importance as Importance}
                      />
                      {task.deadline && (
                        <span className="text-[0.55rem] text-muted-foreground">
                          Due{" "}
                          {new Date(task.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            disabled={selected.size === 0 || submitting}
            onClick={handleSubmit}
          >
            <Plus className="size-3.5" />
            Add {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
