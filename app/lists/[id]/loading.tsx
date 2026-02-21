import { ListViewSkeleton } from "@/components/lists/list-view-skeleton";
import { AppShell } from "@/components/layout/app-shell";

export default function ListLoading() {
  return (
    <AppShell lists={[]}>
      <ListViewSkeleton />
    </AppShell>
  );
}
