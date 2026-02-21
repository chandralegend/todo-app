"use client";

import Link from "next/link";
import { Search, Plus, Menu } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, Activity } from "lucide-react";

function IconBtn({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      className={`flex items-center justify-center rounded-full border border-border bg-card p-2 transition-colors hover:bg-muted cursor-pointer ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TopBar() {
  const { data: session } = useSession();
  const { toggleSidebar } = useSidebar();

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-5xl px-5 py-3 flex items-center justify-between">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <IconBtn onClick={toggleSidebar} aria-label="Toggle sidebar">
            <Menu className="size-4" />
          </IconBtn>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background font-bold text-xs">
              T
            </div>
            <div className="leading-none">
              <p className="font-semibold text-sm">TodoApp</p>
              <p className="text-[0.65rem] text-muted-foreground">Task Manager</p>
            </div>
          </Link>
        </div>

        {/* Right: actions + avatar + search */}
        <div className="flex items-center gap-2">
          <Link href="/lists/new">
            <IconBtn as-child aria-label="New list">
              <Plus className="size-4" />
            </IconBtn>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full hover:bg-muted transition-colors cursor-pointer p-1">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-coral-light text-coral font-semibold text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block leading-none text-left">
                  <p className="text-xs font-medium">{session?.user?.name ?? "User"}</p>
                  <p className="text-[0.65rem] text-muted-foreground">{session?.user?.email ?? ""}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/recurrence">
                  <Activity className="mr-2 size-4" />
                  Recurrence Logs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="mr-2 size-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <IconBtn aria-label="Search" className="hidden sm:flex">
            <Search className="size-4" />
          </IconBtn>
          <Input
            placeholder="Search ..."
            className="hidden lg:block w-44 rounded-full border-border bg-card pl-3 h-8 text-xs"
          />
        </div>
      </div>
    </header>
  );
}
