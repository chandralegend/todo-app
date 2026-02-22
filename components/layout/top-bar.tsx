"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Sun,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Nav links ───────────────────────────────────────────────
const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lists", label: "Lists", icon: ListTodo },
  { href: "/today", label: "Today", icon: Sun },
  { href: "/settings", label: "Settings", icon: Settings },
];

// ─── Props ───────────────────────────────────────────────────
interface SidebarProps {
  onAiClick?: () => void;
  chatOpen?: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// ─── Mobile top bar (visible < md) ──────────────────────────
function MobileTopBar({
  onAiClick,
  chatOpen,
}: {
  onAiClick?: () => void;
  chatOpen?: boolean;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="border-b border-border bg-card min-h-12 sticky top-0 z-40 md:hidden">
      <div className="px-4 py-2 flex items-center justify-between">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="flex items-center justify-center rounded-lg p-1.5 hover:bg-muted transition-colors cursor-pointer"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-xs">
                    T
                  </div>
                  <span className="font-semibold text-sm">TodoApp</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3 gap-0.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
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
              {/* User info at bottom of mobile sheet */}
              <div className="mt-auto border-t border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarFallback className="bg-coral-light text-coral font-semibold text-xs">
                      {session?.user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="leading-none">
                    <p className="text-xs font-medium">{session?.user?.name ?? "User"}</p>
                    <p className="text-[0.65rem] text-muted-foreground">{session?.user?.email ?? ""}</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background font-bold text-[0.6rem]">
              T
            </div>
            <span className="font-semibold text-sm">TodoApp</span>
          </Link>
        </div>

        {/* Right: AI + search placeholder */}
        <div className="flex items-center gap-1.5">
          {onAiClick && (
            <button
              aria-label="AI Assistant"
              onClick={onAiClick}
              className={`flex items-center justify-center rounded-lg p-1.5 transition-colors cursor-pointer ${
                chatOpen ? "bg-coral/10 text-coral" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <Sparkles className="size-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Desktop sidebar (visible >= md) ────────────────────────
function DesktopSidebar({
  onAiClick,
  chatOpen,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

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
    <aside
      className={`hidden md:flex flex-col h-svh sticky top-0 border-r border-border bg-sidebar shrink-0 transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo + collapse toggle */}
      <div className={`flex items-center border-b border-border h-14 shrink-0 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-xs shrink-0">
              T
            </div>
            <span className="font-semibold text-sm">TodoApp</span>
          </Link>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleCollapse}
              className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {collapsed ? "Expand" : "Collapse"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Search (expanded only) */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search..."
              className="w-full rounded-lg border-border bg-card pl-8 h-8 text-xs"
            />
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className={`flex-1 flex flex-col gap-0.5 overflow-y-auto ${collapsed ? "px-2 pt-3" : "px-3 pt-2"}`}>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);

          if (collapsed) {
            return (
              <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={`flex items-center justify-center rounded-lg p-2.5 transition-colors ${
                      active
                        ? "bg-coral/10 text-coral"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {link.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
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

      {/* Bottom section: AI + user */}
      <div className={`border-t border-border shrink-0 ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}>
        {/* AI trigger */}
        {onAiClick && (
          collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onAiClick}
                  className={`flex items-center justify-center rounded-lg p-2.5 w-full transition-colors cursor-pointer mb-2 ${
                    chatOpen
                      ? "bg-coral/10 text-coral"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  aria-label="AI Assistant"
                >
                  <Sparkles className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                AI Assistant
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={onAiClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 w-full text-sm font-medium transition-colors cursor-pointer mb-2 ${
                chatOpen
                  ? "bg-coral/10 text-coral"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Sparkles className="size-4" />
              AI Assistant
            </button>
          )
        )}

        {/* User section */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center justify-center w-full rounded-lg p-1.5 hover:bg-muted transition-colors cursor-pointer">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback className="bg-coral-light text-coral font-semibold text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {session?.user?.name ?? "User"}
                </TooltipContent>
              </Tooltip>
            ) : (
              <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 w-full hover:bg-muted transition-colors cursor-pointer">
                <Avatar className="h-8 w-8 border border-border shrink-0">
                  <AvatarFallback className="bg-coral-light text-coral font-semibold text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-none text-left min-w-0">
                  <p className="text-xs font-medium truncate">{session?.user?.name ?? "User"}</p>
                  <p className="text-[0.6rem] text-muted-foreground truncate">{session?.user?.email ?? ""}</p>
                </div>
              </button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator />
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

        {/* Version label */}
        {!collapsed && (
          <p className="text-[0.55rem] text-muted-foreground text-center mt-2">v0.1.0</p>
        )}
      </div>
    </aside>
  );
}

// ─── Exported combined component ─────────────────────────────
export {
  DesktopSidebar,
  MobileTopBar,
  type SidebarProps,
};
