"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

interface BreadcrumbOverride {
  /** Map a path segment to a display label, e.g. { "abc-123": "Work Tasks" } */
  [segment: string]: string;
}

interface AppBreadcrumbsProps {
  overrides?: BreadcrumbOverride;
}

const defaultLabels: Record<string, string> = {
  "": "Home",
  lists: "Lists",
  new: "New",
  tasks: "Tasks",
  admin: "Admin",
  recurrence: "Recurrence Logs",
  settings: "Settings",
};

export function AppBreadcrumbs({ overrides = {} }: AppBreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items
  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label =
      overrides[segment] ??
      defaultLabels[segment] ??
      decodeURIComponent(segment);
    return { label, href };
  });

  // Prepend Home
  const allCrumbs = [{ label: "Home", href: "/" }, ...crumbs];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {allCrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === allCrumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
