"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";
import { AppBreadcrumbs } from "@/components/layout/breadcrumbs";
import { Toaster } from "@/components/ui/sonner";

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbOverrides?: Record<string, string>;
}

export function AppShell({ children, breadcrumbOverrides }: AppShellProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-svh flex-col">
        <TopBar />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 mx-auto max-w-5xl w-full px-5 py-6">
            {/* Breadcrumbs */}
            <div className="mb-4">
              <AppBreadcrumbs overrides={breadcrumbOverrides} />
            </div>
            {children}
          </main>

          <Footer />
        </div>
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
