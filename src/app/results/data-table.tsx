"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ListCheck } from "lucide-react";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UrlInfo } from "@/lib/schemas.ts";
import { fuzzyFilter, numberFilter } from "@/lib/table-filters.ts";
import { columnHeaders } from "./columns.tsx";
import { ResultsChart } from "./links-chart.tsx";

type DataTableProps<TData, TValue> = {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  className?: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState([]);
  const [filterColumn, setFilterColumn] = useState<
    keyof typeof columnHeaders | "global"
  >("global");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<UrlInfo | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    filterFns: {
      fuzzy: fuzzyFilter,
      numerical: numberFilter,
    },
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    globalFilterFn: "fuzzy",
  });

  return (
    <div className={className}>
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="Search"
          value={
            filterColumn === "global"
              ? globalFilter
              : ((table.getColumn(filterColumn)?.getFilterValue() as string) ??
                "")
          }
          onChange={(e) =>
            filterColumn === "global"
              ? table.setGlobalFilter(String(e.target.value))
              : table.getColumn(filterColumn)?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />

        <Select
          defaultValue="global"
          onValueChange={(value: keyof typeof columnHeaders | "global") => {
            if (filterColumn === "global" && value !== "global") {
              table.setGlobalFilter("");
            }

            table.resetColumnFilters();
            setFilterColumn(value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Global" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">Global</SelectItem>
            {Object.entries(columnHeaders).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-t-sm rounded-b-sm border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="last:border-b-0"
                  onClick={() => {
                    setSelectedRow(row.original as UrlInfo);
                    setIsSheetOpen(true);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        {table.getCanPreviousPage() && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
        )}
        {table.getCanNextPage() && (
          <Button variant="outline" size="sm" onClick={() => table.nextPage()}>
            Next
          </Button>
        )}
      </div>

      {selectedRow && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full">
            <SheetHeader>
              <SheetTitle>{selectedRow.pageTitle}</SheetTitle>
              <SheetDescription>
                Detailed overview of{" "}
                <span className="font-semibold">{selectedRow.baseUrl}</span>
              </SheetDescription>
            </SheetHeader>

            <ResultsChart
              data={[
                { type: "internal", count: selectedRow.internalLinksCount },
                { type: "external", count: selectedRow.externalLinksCount },
              ]}
            />

            {selectedRow.brokenLinks.length > 0 ? (
              <div className="p-4">
                <h3 className="font-medium">Broken Links</h3>

                <div className="mt-2 grid grid-cols-4 gap-y-1">
                  <div className="col-span-3">URL</div>
                  <div className="place-self-center">Status</div>

                  <div className="col-span-4 mb-0.5 h-px bg-zinc-200" />

                  {selectedRow.brokenLinks.map((link) => (
                    <Fragment key={link.url}>
                      <div className="col-span-3">{link.url}</div>{" "}
                      <div className="w-fit place-self-center rounded-sm bg-accent px-1.5 py-0.5 text-zinc-900">
                        {link.statusCode}
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 p-4 ">
                <h3 className="inline-flex items-center gap-1">
                  <ListCheck className="size-4 text-green-800" />
                  All links are accessible
                </h3>

                <p className="text-zinc-500">
                  No issues found with links on this page
                </p>
              </div>
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
