'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type OnChangeFn,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface CustomTableProps<TData> {
  data: TData[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[]
  isLoading?: boolean
  /** Controlled global search string from parent */
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  /** Controlled row selection state from parent */
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  pageSize?: number
  /**
   * Pass totalPage for server-side pagination display.
   * If omitted, page count is derived from data length.
   */
  totalPage?: number
  emptyMessage?: string
  skeletonRows?: number
}

export function CustomTable<TData>({
  data,
  columns,
  isLoading = false,
  globalFilter = '',
  onGlobalFilterChange,
  rowSelection = {},
  onRowSelectionChange,
  pageSize = 10,
  totalPage,
  emptyMessage = 'Tidak ada data.',
  skeletonRows = 6,
}: CustomTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    // When totalPage is provided (server-side), keep page count as-is
    ...(totalPage !== undefined && { pageCount: totalPage }),
  })

  const currentPage  = table.getState().pagination.pageIndex + 1
  const derivedTotal = totalPage ?? table.getPageCount()
  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="flex flex-col gap-3">
      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map(header => (
                  <TableHead key={header.id} className="text-xs">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>
          {isLoading ? (
            <Skeleton className="h-4 w-28" />
          ) : (
            <>
              {table.getFilteredRowModel().rows.length} data
              {selectedCount > 0 && ` · ${selectedCount} dipilih`}
            </>
          )}
        </span>

        <div className="flex items-center gap-2">
          <span>
            Hal {currentPage} / {derivedTotal || 1}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
