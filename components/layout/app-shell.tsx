"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";
import { AppBreadcrumbs } from "@/components/layout/breadcrumbs";
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
  breadcrumbOverrides,
}: AppShellProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar lists={lists} />
        <SidebarInset>
          <TopBar />
          <div className="flex flex-1 flex-col">
            {/* Breadcrumbs */}
            <div className="border-b px-4 sm:px-6 py-3">
              <AppBreadcrumbs overrides={breadcrumbOverrides} />
            </div>

            {/* Main content */}
            <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6">{children}</main>

            {/* Footer */}
            <Footer />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
