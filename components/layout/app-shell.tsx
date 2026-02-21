"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";

type TaskListItem = {
  id: string;
  name: string;
  taskCount: number;
};

interface AppShellProps {
  children: React.ReactNode;
  lists?: TaskListItem[];
  breadcrumbOverrides?: Record<string, string>;
}

export function AppShell({
  children,
  lists = [],
}: AppShellProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar lists={lists} />
        <SidebarInset>
          <TopBar />
          <div className="flex flex-1 flex-col">
            {/* Main content — centered like /design */}
            <main className="flex-1 mx-auto max-w-5xl w-full px-5 py-6">
              {children}
            </main>

            <Footer />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
