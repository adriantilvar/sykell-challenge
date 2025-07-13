"use client";

import type { Cell, ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import type { UrlInfo } from "@/lib/schemas.ts";
import { cn } from "@/lib/utils.ts";

type ColumnType = Omit<UrlInfo, "brokenLinks"> & {
  brokenLinksCount: number;
};

export const columnHeaders: Record<keyof ColumnType, string> = {
  baseUrl: "URL",
  htmlVersion: "HTML Version",
  pageTitle: "Page Title",
  h1Count: "# H1",
  h2Count: "# H2",
  h3Count: "# H3",
  h4Count: "# H4",
  internalLinksCount: "# Internal Links",
  externalLinksCount: "# External Links",
  brokenLinksCount: "# Broken Links",
  hasLoginForm: "Login Required",
} as const;

function getSortableHeader({
  context,
  body,
}: {
  context: HeaderContext<ColumnType, unknown>;
  body: string;
}) {
  const isAscendingOrder = context.column.getIsSorted() === "asc";
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => context.column.toggleSorting(isAscendingOrder)}
    >
      {body}
      <ArrowUp
        className={cn(
          "ml-2 text-zinc-400 transition-transform duration-300 ease-in-out",
          {
            "rotate-180": isAscendingOrder,
          }
        )}
      />
    </Button>
  );
}

function getFormattedCell(cell: Cell<ColumnType, unknown>) {
  return <div className="pl-2.5">{String(cell.getValue())}</div>;
}

export const columns: ColumnDef<ColumnType>[] = [
  {
    accessorKey: "baseUrl",
    header: columnHeaders.baseUrl,
  },
  {
    accessorKey: "htmlVersion",
    header: (context) =>
      getSortableHeader({ context, body: columnHeaders.htmlVersion }),
    cell: ({ cell }) => getFormattedCell(cell),
  },
  {
    accessorKey: "pageTitle",
    header: (context) =>
      getSortableHeader({ context, body: columnHeaders.pageTitle }),
    cell: ({ cell }) => getFormattedCell(cell),
  },
  {
    accessorKey: "h1Count",
    header: (context) =>
      getSortableHeader({ context, body: columnHeaders.h1Count }),
    cell: ({ cell }) => getFormattedCell(cell),
    filterFn: "numerical",
  },
  {
    accessorKey: "h2Count",
    header: (context) =>
      getSortableHeader({ context, body: columnHeaders.h2Count }),
    cell: ({ cell }) => getFormattedCell(cell),
    filterFn: "numerical",
  },
  {
    accessorKey: "h3Count",
    header: (context) =>
      getSortableHeader({ context, body: columnHeaders.h3Count }),
    cell: ({ cell }) => getFormattedCell(cell),
    filterFn: "numerical",
  },
  {
    accessorKey: "h4Count",
    header: (context) =>
      getSortableHeader({ context, body: columnHeaders.h4Count }),
    cell: ({ cell }) => getFormattedCell(cell),
    filterFn: "numerical",
  },
  {
    accessorKey: "internalLinksCount",
    header: (context) =>
      getSortableHeader({ context, body: columnHeaders.internalLinksCount }),
    cell: ({ cell }) => getFormattedCell(cell),
    filterFn: "numerical",
  },
  {
    accessorKey: "externalLinksCount",
    header: (context) =>
      getSortableHeader({ context, body: columnHeaders.externalLinksCount }),
    cell: ({ cell }) => getFormattedCell(cell),
    filterFn: "numerical",
  },
  {
    accessorKey: "brokenLinksCount",
    header: (context) =>
      getSortableHeader({ context, body: columnHeaders.brokenLinksCount }),
    cell: ({ cell }) => getFormattedCell(cell),
    filterFn: "numerical",
  },
  {
    accessorKey: "hasLoginForm",
    header: (context) =>
      getSortableHeader({ context, body: columnHeaders.hasLoginForm }),
    cell: ({ cell }) => (
      <div className="pl-3">{cell.getValue() ? "Yes" : "No"}</div>
    ),
  },
];
