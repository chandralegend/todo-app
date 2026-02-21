"use client";

import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";
import { AppBreadcrumbs } from "@/components/layout/breadcrumbs";
import { Toaster } from "@/components/ui/sonner";
import { ChatSidebar } from "@/components/ai/chat-sidebar";

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbOverrides?: Record<string, string>;
  /** Rendered on the right side of the breadcrumbs bar (e.g. an action button) */
  action?: React.ReactNode;
}

export function AppShell({ children, breadcrumbOverrides, action }: AppShellProps) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-svh flex-col">
        <TopBar onAiClick={() => setChatOpen(true)} />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 mx-auto max-w-5xl w-full px-5 py-6">
            {/* Breadcrumbs + action */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <AppBreadcrumbs overrides={breadcrumbOverrides} />
              {action}
            </div>
            {children}
          </main>

          <Footer />
        </div>
      </div>

      <ChatSidebar open={chatOpen} onOpenChange={setChatOpen} />
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
