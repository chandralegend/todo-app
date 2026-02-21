"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-svh flex-col">
        <TopBar />
        <div className="flex flex-1 flex-col">
          {/* Main content — centered like /design */}
          <main className="flex-1 mx-auto max-w-5xl w-full px-5 py-6">
            {children}
          </main>

          <Footer />
        </div>
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
