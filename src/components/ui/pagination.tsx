"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/*
  Composants Pagination inspirés de shadcn/ui
  --------------------------------------------------
  Pagination
  PaginationContent
  PaginationItem
  PaginationLink (Next.js <Link>)
  PaginationPrevious
  PaginationNext
  PaginationEllipsis
*/

export function Pagination({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

export const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

export const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn(className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

interface PaginationLinkProps extends React.ComponentProps<typeof Link> {
  isActive?: boolean;
  disabled?: boolean;
}

export function PaginationLink({
  className,
  isActive,
  disabled,
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background px-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-primary text-primary-foreground hover:bg-primary",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function PaginationPrevious({
  className,
  ...props
}: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="Page précédente"
      className={cn(
        "gap-1 pl-2.5 w-auto min-w-[88px] px-3",
        "sm:min-w-[100px]",
        className
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Précédent</span>
    </PaginationLink>
  );
}

export function PaginationNext({ className, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="Page suivante"
      className={cn(
        "gap-1 pr-2.5 w-auto min-w-[88px] px-3",
        "sm:min-w-[100px]",
        className
      )}
      {...props}
    >
      <span className="hidden sm:inline">Suivant</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">Autres pages</span>
    </span>
  );
}
