'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// ── Schema ────────────────────────────────────────────────────────────────────

export const disbursementSchema = z.object({
  sender_name: z
    .string()
    .min(1, 'Nama pengirim wajib diisi')
    .min(3, 'Minimal 3 karakter'),
  account_number: z
    .string()
    .min(1, 'Nomor rekening wajib diisi')
    .regex(/^\d+$/, 'Hanya boleh angka')
    .min(6, 'Minimal 6 digit')
    .max(20, 'Maksimal 20 digit'),
  bank: z
    .string()
    .min(1, 'Bank wajib dipilih'),
  amount: z.coerce
    .number({ invalid_type_error: 'Harus berupa angka' })
    .min(10_000, 'Minimal Rp 10.000')
    .max(999_999_999, 'Maksimal Rp 999.999.999'),
  date: z.date({ required_error: 'Tanggal wajib dipilih' }),
  note: z.string().optional(),
})

export type DisbursementFormValues = z.infer<typeof disbursementSchema>


export const BANK_OPTIONS = [
  'BCA', 'BRI', 'BNI', 'Mandiri', 'CIMB Niaga',
  'Danamon', 'Permata', 'BTN', 'OCBC', 'Maybank',
]

export function calculateAdminFee(amount: number): number {
  if (amount <= 0) throw new Error('Amount harus lebih dari 0')
  if (amount >= 5_000_000) return 5_000
  return 2_500
}

// ── Component ─────────────────────────────────────────────────────────────────

interface DisbursementFormProps {
  onSubmit: (values: DisbursementFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function DisbursementForm({ onSubmit, onCancel, isSubmitting }: DisbursementFormProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  const form = useForm<DisbursementFormValues>({
    resolver: zodResolver(disbursementSchema),
    defaultValues: {
      sender_name: '',
      account_number: '',
      bank: '',
      amount: 0,
      date: new Date(),
    },
  })

  const watchedAmount = form.watch('amount')
  const adminFee      = Number(watchedAmount) > 0 ? calculateAdminFee(Number(watchedAmount)) : 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {/* Sender name */}
        <FormField
          control={form.control}
          name="sender_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Pengirim</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Budi Santoso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bank + Account number — 2 col */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="bank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger aria-invalid={!!form.formState.errors.bank} className='w-full'>
                      <SelectValue placeholder="Pilih bank..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BANK_OPTIONS.map(bank => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Rekening</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: 1234567890"
                    inputMode="numeric"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Transaksi</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 shrink-0" />
                      {field.value
                        ? format(field.value, 'dd MMMM yyyy', { locale: localeId })
                        : 'Pilih tanggal...'}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={date => {
                      field.onChange(date)
                      setCalendarOpen(false)
                    }}
                    disabled={date => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount + admin fee — 2 col */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah Transfer</FormLabel>
                <FormControl>
                  <CurrencyInput
                    placeholder="0"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Admin fee — read-only, derived */}
          <FormItem>
            <FormLabel>Biaya Admin</FormLabel>
            <CurrencyInput value={adminFee} readOnly className="bg-muted text-muted-foreground cursor-default" />
            <FormDescription>Dihitung otomatis berdasarkan jumlah</FormDescription>
          </FormItem>
        </div>

        {/* Note */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Catatan
                <span className="ml-1 text-xs text-muted-foreground font-normal">(opsional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Contoh: Pembayaran supplier bulanan"
                  rows={3}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? 'Menyimpan...' : 'Buat Disbursement'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
