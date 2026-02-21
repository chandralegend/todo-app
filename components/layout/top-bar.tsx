"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, Menu, LayoutDashboard, ListTodo, Activity } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PillButton } from "@/components/ui/pill-button";
import { Settings, LogOut } from "lucide-react";

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

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lists/new", label: "My Lists", icon: ListTodo },
  { href: "/admin/recurrence", label: "Admin", icon: Activity },
];

export function TopBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-5xl px-5 py-3 flex items-center gap-3">
        {/* Mobile/Tablet: Hamburger + Logo (hidden on desktop) */}
        <div className="flex items-center gap-3 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <IconBtn aria-label="Open menu">
                <Menu className="size-4" />
              </IconBtn>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background font-bold text-xs">
                    T
                  </div>
                  <span className="font-semibold text-sm">TodoApp</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "bg-coral/10 text-coral"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-border p-4">
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <PillButton variant="primary" size="sm" className="w-full justify-center">
                    Show my Tasks
                  </PillButton>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
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

        {/* Desktop: Nav links (hidden on mobile/tablet) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-coral/10 text-coral"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop: Show my Tasks pill (hidden on mobile) */}
        <div className="hidden lg:flex ml-1">
          <Link href="/">
            <PillButton variant="primary" size="sm">
              Show my Tasks
            </PillButton>
          </Link>
        </div>

        {/* Center: Search (grows to fill space) */}
        <div className="flex-1 flex justify-center px-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search ..."
              className="w-full rounded-full border-border bg-card pl-9 h-8 text-xs"
            />
          </div>
        </div>

        {/* Right: actions + avatar */}
        <div className="flex items-center gap-2">
          <Link href="/lists/new" className="hidden sm:block">
            <IconBtn aria-label="New list">
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
        </div>
      </div>
    </header>
  );
}
