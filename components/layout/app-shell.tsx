"use client";

import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";
import { AppBreadcrumbs } from "@/components/layout/breadcrumbs";
import { Toaster } from "@/components/ui/sonner";
import { ChatPanel } from "@/components/ai/chat-sidebar";

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
      <div className="flex min-h-svh">
        {/* Main content column — full height, scrolls independently */}
        <div
          className={`flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300 ${
            chatOpen ? "hidden sm:flex" : "flex"
          }`}
        >
          <TopBar
            onAiClick={() => setChatOpen((o) => !o)}
            chatOpen={chatOpen}
          />
          <main className="flex-1 mx-auto max-w-5xl w-full px-5 py-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <AppBreadcrumbs overrides={breadcrumbOverrides} />
              {action}
            </div>
            {children}
          </main>
          <Footer />
        </div>

        {/* Chat panel — full viewport height, pushes content */}
        <div
          className={`border-l border-border bg-card transition-all duration-300 ease-in-out shrink-0 overflow-hidden h-svh sticky top-0 ${
            chatOpen
              ? "w-full sm:w-[380px] lg:w-[420px]"
              : "w-0 border-l-0"
          }`}
        >
          {chatOpen && (
            <ChatPanel onClose={() => setChatOpen(false)} />
          )}
        </div>
      </div>

      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
