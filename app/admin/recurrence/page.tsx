import { redirect } from "next/navigation";

// Recurrence logs moved to /settings (Recurrence tab)
export default function RecurrenceAdminPage() {
  redirect("/settings");
}
