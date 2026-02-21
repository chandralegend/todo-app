"use client";

import { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Sparkles, Trash2, X } from "lucide-react";
import { TaskListsResult, TasksInListResult } from "./tool-ui/task-list-card";
import {
  CreatedTaskCard,
  CreatedListCard,
  StatusUpdateCard,
  TodayFocusCard,
} from "./tool-ui/mutation-result";
import { PlanPreview } from "./tool-ui/plan-preview";

// Data tools are silent — no UI rendered for these
const SILENT_TOOLS = new Set([
  "tool-getTaskLists",
  "tool-getTasksInList",
  "tool-getPendingTasks",
  "tool-getTodayTasks",
]);

interface ChatPanelProps {
  onClose: () => void;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const {
    messages,
    setMessages,
    sendMessage,
    status,
    error,
    addToolOutput,
  } = useChat({
    id: "todo-ai-chat",
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-slot='scroll-area-viewport']"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const isLoading = status === "streaming" || status === "submitted";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const text = (formData.get("message") as string)?.trim();
    if (!text || isLoading) return;
    form.reset();
    await sendMessage({ text });
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  function renderToolPart(part: any) {
    const { type, state } = part;

    // Silent data tools — render nothing
    if (SILENT_TOOLS.has(type)) {
      return null;
    }

    // While tool is streaming input, show a brief indicator for visible tools
    if (state === "input-streaming") {
      return (
        <div className="flex items-center gap-1.5 text-muted-foreground py-1">
          <Loader2 className="size-3 animate-spin" />
          <span className="text-xs">Working...</span>
        </div>
      );
    }

    // Render based on tool name
    switch (type) {
      // ─── Display tools (generative UI) ───
      case "tool-showTasks":
        if (state === "output-available") {
          return (
            <TasksInListResult
              data={{
                list: part.output.title ?? "Tasks",
                tasks: part.output.tasks,
              }}
            />
          );
        }
        break;

      case "tool-showTaskLists":
        if (state === "output-available") {
          return <TaskListsResult data={part.output.lists} />;
        }
        break;

      // ─── Mutation tools (confirmation cards) ───
      case "tool-createTaskList":
        if (state === "output-available") {
          return <CreatedListCard data={part.output} />;
        }
        break;

      case "tool-createTask":
        if (state === "output-available") {
          return <CreatedTaskCard data={part.output} />;
        }
        break;

      case "tool-updateTaskStatus":
        if (state === "output-available") {
          return <StatusUpdateCard data={part.output} />;
        }
        break;

      case "tool-addToTodayFocus":
        if (state === "output-available") {
          return <TodayFocusCard data={part.output} />;
        }
        break;

      // ─── Interactive tools ───
      case "tool-planMyDay": {
        const planTasks = part.input?.tasks ?? [];
        const planTaskIds = planTasks.map((t: { id: string }) => t.id);
        return (
          <PlanPreview
            input={part.input}
            state={state}
            onAccept={() => {
              addToolOutput({
                tool: "planMyDay",
                toolCallId: part.toolCallId,
                output: { accepted: true, taskIds: planTaskIds },
              });
            }}
            onReject={() => {
              addToolOutput({
                tool: "planMyDay",
                toolCallId: part.toolCallId,
                output: { accepted: false, taskIds: [] },
              });
            }}
          />
        );
      }
    }

    // For input-available state on visible tools, show executing
    if (state === "input-available") {
      return (
        <div className="flex items-center gap-1.5 text-muted-foreground py-1">
          <Loader2 className="size-3 animate-spin" />
          <span className="text-xs">Executing...</span>
        </div>
      );
    }

    // For output-error state
    if (state === "output-error") {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30 p-2 text-xs text-red-600">
          Tool error: {part.errorText ?? "Unknown error"}
        </div>
      );
    }

    return null;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header — height aligned with TopBar */}
      <div className="border-b border-border px-4 py-3 shrink-0 min-h-14 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-3.5 text-primary" />
            </div>
            AI Assistant
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setMessages([])}
                title="Clear chat"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              title="Close chat"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <Bot className="size-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">
                  How can I help you today?
                </p>
                <p className="text-xs text-muted-foreground max-w-[240px]">
                  I can manage your tasks, create lists, plan your day, and
                  more.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                  {[
                    "Plan my day",
                    "Show my lists",
                    "What's overdue?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage({ text: suggestion })}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                    <Bot className="size-3 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] space-y-2 ${
                    message.role === "user" ? "order-first" : ""
                  }`}
                >
                  {message.parts.map((part, i) => {
                    if (part.type === "text" && part.text.trim()) {
                      return (
                        <div
                          key={i}
                          className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <span className="whitespace-pre-wrap">
                            {part.text}
                          </span>
                        </div>
                      );
                    }

                    // Tool invocations
                    if (part.type?.startsWith("tool-")) {
                      const rendered = renderToolPart(part);
                      if (rendered) {
                        return <div key={i}>{rendered}</div>;
                      }
                    }

                    return null;
                  })}
                </div>

                {message.role === "user" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                    <User className="size-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                  <Bot className="size-3 text-primary" />
                </div>
                <div className="bg-muted rounded-xl px-3 py-2">
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30 px-3 py-2 text-xs text-red-600">
          {error.message}
        </div>
      )}

      {/* Input area — height aligned with Footer */}
      <div className="border-t border-border px-4 py-2 shrink-0 min-h-12 flex items-center">
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input
            ref={inputRef}
            name="message"
            placeholder="Ask me anything..."
            className="h-9 text-xs rounded-full"
            autoComplete="off"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 rounded-full shrink-0"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
