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
  type PaginationState,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100]

export interface CustomTableProps<TData> {
  data: TData[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[]
  isLoading?: boolean
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  getRowId?: (row: TData) => string
  pageSize?: number
  pageSizeOptions?: number[]
  totalPage?: number
  initialSorting?: SortingState
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
  getRowId,
  pageSize: initialPageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  totalPage,
  initialSorting = [],
  emptyMessage = 'Tidak ada data.',
  skeletonRows = 6,
}: CustomTableProps<TData>) {
  const [sorting,    setSorting]    = useState<SortingState>(initialSorting)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize:  initialPageSize,
  })

  const table = useReactTable<TData>({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection, pagination },
    onSortingChange:         setSorting,
    onGlobalFilterChange,
    onRowSelectionChange,
    onPaginationChange:      setPagination,
    getCoreRowModel:         getCoreRowModel(),
    getSortedRowModel:       getSortedRowModel(),
    getFilteredRowModel:     getFilteredRowModel(),
    getPaginationRowModel:   getPaginationRowModel(),
    enableRowSelection:      true,
    ...(getRowId && { getRowId }),
    ...(totalPage !== undefined && { pageCount: totalPage }),
  })

  const currentPage    = pagination.pageIndex + 1
  const derivedTotal   = totalPage ?? table.getPageCount()
  const selectedCount  = Object.keys(rowSelection).filter(k => rowSelection[k]).length
  const filteredCount  = table.getFilteredRowModel().rows.length

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
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={`${row.id}-${i}`}
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
        {/* Left: count info */}
        <span>
          {isLoading ? (
            <Skeleton className="h-4 w-28" />
          ) : (
            <>
              {filteredCount} data
              {selectedCount > 0 && ` · ${selectedCount} dipilih`}
            </>
          )}
        </span>

        {/* Right: page size + navigation */}
        <div className="flex items-center gap-3">
          {/* Per-page selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs">Baris per hal.</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={v => {
                table.setPageSize(Number(v))
                table.setPageIndex(0)
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(n => (
                  <SelectItem key={n} value={String(n)} className="text-xs">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page info + prev/next */}
          <div className="flex items-center gap-2">
            <span>Hal {currentPage} / {derivedTotal || 1}</span>
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
    </div>
  )
}
