"use client";

import type { Cell, ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import type { UrlInfo } from "@/lib/schemas.ts";
import { cn } from "@/lib/utils.ts";

export const columnHeaders: Record<keyof UrlInfo, string> = {
  baseUrl: "URL",
  htmlVersion: "HTML Version",
  pageTitle: "Page Title",
  h1Count: "# H1",
  h2Count: "# H2",
  h3Count: "# H3",
  h4Count: "# H4",
  internalLinksCount: "# Internal Links",
  externalLinksCount: "# External Links",
  brokenLinks: "# Broken Links",
  hasLoginForm: "Login Required",
} as const;

function getSortableHeader({
  context,
  body,
}: {
  context: HeaderContext<UrlInfo, unknown>;
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

function getFormattedCell(cell: Cell<UrlInfo, unknown>) {
  return <div className="pl-2.5">{String(cell.getValue())}</div>;
}

export const columns: ColumnDef<UrlInfo>[] = [
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
    accessorKey: "brokenLinks",
    header: (context) =>
      getSortableHeader({ context, body: columnHeaders.brokenLinks }),
    cell: ({ cell }) => (
      <div className="pl-2.5">
        {String((cell.getValue() as UrlInfo["brokenLinks"]).length)}
      </div>
    ),
    filterFn: (row, _, filterValue) => {
      const numericalValue = Number(filterValue);
      const linkCount = row.getValue(
        "brokenLinks"
      ) satisfies UrlInfo["brokenLinks"];

      if (Number.isNaN(numericalValue)) return false;

      return linkCount.length === numericalValue;
    },
  },
  {
    accessorKey: "hasLoginForm",
    header: (context) =>
      getSortableHeader({ context, body: columnHeaders.hasLoginForm }),
    cell: (cell) => (
      <div className="pl-3">{cell.getValue() ? "Yes" : "No"}</div>
    ),
  },
];
