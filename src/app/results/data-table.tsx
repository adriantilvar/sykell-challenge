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
import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fuzzyFilter, numberFilter } from "@/lib/table-filters.ts";
import { columnHeaders } from "./columns.tsx";

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
    </div>
  );
}
