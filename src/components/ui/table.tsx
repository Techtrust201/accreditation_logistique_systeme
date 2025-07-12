"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// Types pour le tri
export type SortDirection = "asc" | "desc";

export interface SortableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
}

export interface SortableTableProps<T> {
  data: T[];
  columns: SortableColumn<T>[];
  sortKey?: keyof T;
  sortDir?: SortDirection;
  onSort?: (key: keyof T, dir: SortDirection) => void;
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
}

// Composant de caret de tri
function SortCaret({ active, dir }: { active: boolean; dir: SortDirection }) {
  if (!active) return <span className="opacity-30 text-xs">↕</span>;
  return dir === "asc" ? (
    <span className="text-xs">▲</span>
  ) : (
    <span className="text-xs">▼</span>
  );
}

// Composant de tableau triable réutilisable
export function SortableTable<
  T extends Record<string, string | number | boolean | null | undefined>,
>({
  data,
  columns,
  sortKey,
  sortDir = "asc",
  onSort,
  className,
  headerClassName,
  rowClassName,
  cellClassName,
}: SortableTableProps<T>) {
  const handleSort = (key: keyof T) => {
    if (!onSort) return;

    const isActive = sortKey === key;
    const nextDir: SortDirection =
      isActive && sortDir === "asc" ? "desc" : "asc";
    onSort(key, nextDir);
  };

  return (
    <Table className={className}>
      <TableHeader className={headerClassName}>
        <TableRow>
          {columns.map((column) => {
            const isActive = sortKey === column.key;
            const isSortable = column.sortable !== false && onSort;

            return (
              <TableHead
                key={String(column.key)}
                className={cn(
                  isSortable && "cursor-pointer select-none hover:bg-muted/30",
                  cellClassName
                )}
                onClick={isSortable ? () => handleSort(column.key) : undefined}
                aria-sort={
                  isActive
                    ? sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <div className="flex items-center gap-1">
                  <span>{column.label}</span>
                  {isSortable && <SortCaret active={isActive} dir={sortDir} />}
                </div>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index} className={rowClassName}>
            {columns.map((column) => (
              <TableCell key={String(column.key)} className={cellClassName}>
                {String(row[column.key] ?? "")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
