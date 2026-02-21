import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLoading() {
  return (
    <AppShell>
      <DashboardSkeleton />
    </AppShell>
  );
}
