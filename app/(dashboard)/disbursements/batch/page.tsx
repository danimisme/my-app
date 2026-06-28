'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm, useFieldArray, useController } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { CalendarIcon, Loader2, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/providers/user-provider'
import { useCreateTransaction } from '@/hooks/UseTransaction'
import { BANK_OPTIONS, calculateAdminFee } from '../components/DisbursementForm'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Form } from '@/components/ui/form'
import type { Control } from 'react-hook-form'

const batchRowSchema = z.object({
  sender_name:    z.string().min(1, 'Wajib diisi').min(3, 'Min 3 karakter'),
  account_number: z.string().min(1, 'Wajib diisi').regex(/^\d{6,20}$/, '6–20 digit angka'),
  bank:           z.string().min(1, 'Wajib dipilih'),
  amount:         z.coerce
    .number({ invalid_type_error: 'Harus angka' })
    .min(10_000, 'Min Rp 10.000')
    .max(999_999_999, 'Max Rp 999 juta'),
  date:           z.date({ required_error: 'Wajib diisi' }),
  note:           z.string().optional(),
})

const batchSchema = z.object({
  rows: z.array(batchRowSchema).min(1).max(10),
})

type BatchFormValues = z.infer<typeof batchSchema>
type BatchRowValues  = z.infer<typeof batchRowSchema>

const MAX_ROWS = 10

const COLS = '2.5rem minmax(150px,1.5fr) 7.5rem 9.5rem 8.5rem 10rem 8rem minmax(100px,1fr) 2.5rem'

function defaultRow(): BatchRowValues {
  return { sender_name: '', account_number: '', bank: '', amount: 0, date: new Date(), note: '' }
}

function fmtNumber(n: number) { return new Intl.NumberFormat('id-ID').format(n) }
function parseRaw(s: string)  { const d = s.replace(/\D/g, ''); return d ? parseInt(d, 10) : 0 }

// Borderless input that fits flush inside a table cell
const cellCls = [
  'h-9 w-full bg-transparent border-0 shadow-none rounded-none px-2 py-0',
  'text-sm placeholder:text-muted-foreground/50',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
].join(' ')

// ── Cell wrapper ───────────────────────────────────────────────────────────────

function Cell({
  error,
  last = false,
  className,
  children,
}: {
  error?: string
  last?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col', !last && 'border-r border-border', className)}>
      <div className={cn('relative flex-1', error && 'ring-1 ring-inset ring-destructive')}>
        {children}
      </div>
      {error && (
        <p className="px-2 py-0.5 text-[10px] leading-tight text-destructive bg-destructive/5">
          {error}
        </p>
      )}
    </div>
  )
}

// ── Row component ──────────────────────────────────────────────────────────────

interface BatchRowProps {
  index:    number
  control:  Control<BatchFormValues>
  onRemove: () => void
  isOnly:   boolean
}

function BatchTableRow({ index, control, onRemove, isOnly }: BatchRowProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  const { field: fSender, fieldState: eSender } = useController({ control, name: `rows.${index}.sender_name` })
  const { field: fBank, fieldState: eBank } = useController({ control, name: `rows.${index}.bank` })
  const { field: fAccount, fieldState: eAccount } = useController({ control, name: `rows.${index}.account_number` })
  const { field: fDate, fieldState: eDate } = useController({ control, name: `rows.${index}.date` })
  const { field: fAmount, fieldState: eAmount } = useController({ control, name: `rows.${index}.amount` })
  const { field: fNote } = useController({ control, name: `rows.${index}.note` })

  // Inline currency display state
  const [amountDisplay, setAmountDisplay] = useState(() => fmtNumber(fAmount.value || 0).replace(/^0$/, ''))
  const lastAmount = useRef(fAmount.value)

  useEffect(() => {
    if (fAmount.value !== lastAmount.current) {
      lastAmount.current = fAmount.value
      setAmountDisplay(fAmount.value ? fmtNumber(fAmount.value) : '')
    }
  }, [fAmount.value])

  function handleAmount(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseRaw(e.target.value)
    lastAmount.current = raw
    setAmountDisplay(raw ? fmtNumber(raw) : '')
    fAmount.onChange(raw)
  }

  const adminFee = calculateAdminFee(Number(fAmount.value) || 0)

  return (
    <div
      className="grid border-b last:border-b-0 hover:bg-muted/20"
      style={{ gridTemplateColumns: COLS }}
    >
      {/* # */}
      <div className="flex items-center justify-center border-r border-border text-xs text-muted-foreground select-none">
        {index + 1}
      </div>

      {/* Nama Pengirim */}
      <Cell error={eSender.error?.message}>
        <input
          {...fSender}
          className={cellCls}
          placeholder="Nama pengirim"
        />
      </Cell>

      {/* Bank */}
      <Cell error={eBank.error?.message}>
        <Select onValueChange={fBank.onChange} value={fBank.value}>
          <SelectTrigger className="h-9 w-full border-0 shadow-none rounded-none bg-transparent text-sm px-2 focus:ring-2 focus:ring-ring focus:ring-inset">
            <SelectValue placeholder="Bank" />
          </SelectTrigger>
          <SelectContent>
            {BANK_OPTIONS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </Cell>

      {/* No. Rekening */}
      <Cell error={eAccount.error?.message}>
        <input
          {...fAccount}
          inputMode="numeric"
          className={cellCls}
          placeholder="No. rekening"
        />
      </Cell>

      {/* Tanggal */}
      <Cell error={eDate.error?.message}>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'h-9 w-full flex items-center gap-1.5 px-2 text-sm rounded-none',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                !fDate.value && 'text-muted-foreground/50'
              )}
            >
              <CalendarIcon className="size-3 shrink-0" />
              {fDate.value
                ? format(fDate.value, 'dd MMM yyyy', { locale: localeId })
                : 'Tanggal'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fDate.value}
              onSelect={d => { fDate.onChange(d); setCalendarOpen(false) }}
              disabled={d => d > new Date()}
            />
          </PopoverContent>
        </Popover>
      </Cell>

      {/* Jumlah Transfer */}
      <Cell error={eAmount.error?.message}>
        <div className="relative flex items-center">
          <span className="absolute left-2 text-[11px] text-muted-foreground pointer-events-none select-none">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={amountDisplay}
            onChange={handleAmount}
            onBlur={fAmount.onBlur}
            name={fAmount.name}
            ref={fAmount.ref}
            className={cn(cellCls, 'pl-7')}
            placeholder="0"
          />
        </div>
      </Cell>

      {/* Biaya Admin — read-only */}
      <div className="flex items-center px-2 border-r border-border bg-muted/30 text-sm text-muted-foreground select-none">
        Rp {fmtNumber(adminFee)}
      </div>

      {/* Catatan */}
      <Cell last>
        <input
          {...fNote}
          value={fNote.value ?? ''}
          className={cellCls}
          placeholder="Catatan (opsional)"
        />
      </Cell>

      {/* Hapus */}
      <div className="flex items-center justify-center border-l border-border">
        <button
          type="button"
          onClick={onRemove}
          disabled={isOnly}
          className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}


const ALLOWED_ROLES = ['operator', 'admin', 'superadmin']

export default function BatchDisbursementPage() {
  const { role } = useUser()
  const router   = useRouter()
  const createTransaction = useCreateTransaction()

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: { rows: [defaultRow()] },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rows',
  })

  if (!ALLOWED_ROLES.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <ShieldAlert className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    )
  }

  async function onSubmit(values: BatchFormValues) {
    await Promise.all(
      values.rows.map(row => {
        const d = new Date(row.date)
        d.setHours(12, 0, 0, 0)
        return createTransaction.mutateAsync({
          sender_name: row.sender_name,
          account_number: row.account_number,
          bank: row.bank,
          amount: row.amount,
          admin_fee: calculateAdminFee(row.amount),
          status: 'PENDING',
          note: row.note ?? '',
          created_at: d.toISOString(),
        })
      })
    )
    router.push('/disbursements')
  }

  const isSubmitting = createTransaction.isPending

  return (
    <div className="mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Batch Disbursement</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Buat beberapa disbursement sekaligus. Maksimal {MAX_ROWS} baris.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-x-auto">
            <div style={{ minWidth: '860px' }}>

              {/* Header */}
              <div
                className="grid bg-muted/60 border-b border-border text-xs font-medium text-muted-foreground"
                style={{ gridTemplateColumns: COLS }}
              >
                {[
                  { label: '#', cls: 'justify-center border-r' },
                  { label: 'Nama Pengirim', cls: 'border-r' },
                  { label: 'Bank', cls: 'border-r' },
                  { label: 'No. Rekening', cls: 'border-r' },
                  { label: 'Tanggal', cls: 'border-r' },
                  { label: 'Jumlah Transfer', cls: 'border-r' },
                  { label: 'Biaya Admin', cls: 'border-r' },
                  { label: 'Catatan', cls: '' },
                  { label: '', cls: 'border-l' },
                ].map(({ label, cls }) => (
                  <div key={label} className={cn('flex items-center px-2 py-2.5', cls)}>
                    {label}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {fields.map((field, index) => (
                <BatchTableRow
                  key={field.id}
                  index={index}
                  control={form.control}
                  onRemove={() => remove(index)}
                  isOnly={fields.length === 1}
                />
              ))}

              {/* Add row button */}
              {fields.length < MAX_ROWS && (
                <button
                  type="button"
                  onClick={() => append(defaultRow())}
                  className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                >
                  <Plus className="size-3.5" />
                  Tambah Baris
                  <span className="text-xs opacity-60">({fields.length}/{MAX_ROWS})</span>
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {fields.length} baris &bull; {fields.length} transaksi akan dibuat
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/disbursements')}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                {isSubmitting ? 'Menyimpan...' : `Buat ${fields.length} Disbursement`}
              </Button>
            </div>
          </div>

        </form>
      </Form>
    </div>
  )
}
