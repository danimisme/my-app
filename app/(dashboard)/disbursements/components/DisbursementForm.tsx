'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
    .regex(/^\d{6,20}$/, 'Harus 6–20 digit angka'),
  bank: z
    .string()
    .min(1, 'Bank wajib dipilih'),
  amount: z.coerce
    .number({ invalid_type_error: 'Harus berupa angka' })
    .min(10_000, 'Minimal Rp 10.000')
    .max(999_999_999, 'Maksimal Rp 999.999.999'),
  note: z.string().optional(),
})

export type DisbursementFormValues = z.infer<typeof disbursementSchema>

// ── Constants ─────────────────────────────────────────────────────────────────

const BANK_OPTIONS = [
  'BCA', 'BRI', 'BNI', 'Mandiri', 'CIMB Niaga',
  'Danamon', 'Permata', 'BTN', 'OCBC', 'Maybank',
]

export function calculateAdminFee(amount: number): number {
  if (amount >= 25_000_000) return 10_000
  if (amount >= 1_000_000)  return 5_000
  return 2_500
}

// ── Component ─────────────────────────────────────────────────────────────────

interface DisbursementFormProps {
  onSubmit: (values: DisbursementFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function DisbursementForm({ onSubmit, onCancel, isSubmitting }: DisbursementFormProps) {
  const form = useForm<DisbursementFormValues>({
    resolver: zodResolver(disbursementSchema),
    defaultValues: {
      sender_name:    '',
      account_number: '',
      bank:           '',
      amount:         0,
      note:           '',
    },
  })

  const watchedAmount = form.watch('amount')
  const adminFee      = calculateAdminFee(Number(watchedAmount) || 0)

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
                    <SelectTrigger aria-invalid={!!form.formState.errors.bank}>
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

        {/* Amount + admin fee — 2 col */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah Transfer</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Contoh: 1250000"
                    inputMode="numeric"
                    min={0}
                    {...field}
                  />
                </FormControl>
                {watchedAmount > 0 && (
                  <FormDescription>{formatRupiah(Number(watchedAmount))}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Admin fee — read-only, derived */}
          <FormItem>
            <FormLabel>Biaya Admin</FormLabel>
            <Input value={formatRupiah(adminFee)} readOnly className="bg-muted text-muted-foreground" />
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
