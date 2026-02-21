"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Settings,
  Activity,
  Plus,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type TaskListItem = {
  id: string;
  name: string;
  taskCount: number;
};

interface AppSidebarProps {
  lists?: TaskListItem[];
}

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "My Lists", href: "/#lists", icon: ListTodo },
];

const adminItems = [
  { title: "Recurrence Logs", href: "/admin/recurrence", icon: Activity },
];

export function AppSidebar({ lists = [] }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background font-bold text-xs">
            T
          </div>
          <div className="leading-none group-data-[collapsible=icon]:hidden">
            <p className="font-semibold text-sm">TodoApp</p>
            <p className="text-[0.65rem] text-muted-foreground">Task Manager</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href)
                    }
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* User's Lists */}
        <SidebarGroup>
          <SidebarGroupLabel>My Lists</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {lists.map((list) => (
                <SidebarMenuItem key={list.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/lists/${list.id}`}
                    tooltip={list.name}
                  >
                    <Link href={`/lists/${list.id}`}>
                      <ListTodo className="size-4" />
                      <span>{list.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{list.taskCount}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New List">
                  <Link href="/lists/new">
                    <Plus className="size-4" />
                    <span>New List</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Admin */}
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" asChild>
              <Link href="/settings">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={session?.user?.name ?? "User"}
              className="gap-3"
            >
              <Avatar className="h-7 w-7 rounded-md">
                <AvatarFallback className="rounded-md bg-coral-light text-coral text-xs font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-sm font-medium truncate">
                  {session?.user?.name ?? "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {session?.user?.email ?? ""}
                </span>
              </div>
              <ChevronRight className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
