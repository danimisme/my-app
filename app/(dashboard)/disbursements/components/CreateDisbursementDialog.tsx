'use client'

import { useCreateTransaction } from '@/lib/api/hooks/transaction'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DisbursementForm, calculateAdminFee } from './DisbursementForm'
import type { DisbursementFormValues } from './DisbursementForm'

interface CreateDisbursementDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateDisbursementDialog({ open, onClose }: CreateDisbursementDialogProps) {
  const createTransaction = useCreateTransaction()

  async function handleSubmit(values: DisbursementFormValues) {
    await createTransaction.mutateAsync({
      sender_name:    values.sender_name,
      account_number: values.account_number,
      bank:           values.bank,
      amount:         values.amount,
      admin_fee:      calculateAdminFee(values.amount),
      status:         'PENDING',
      note:           values.note ?? '',
      created_at:     values.date.toISOString(),
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Buat Disbursement</DialogTitle>
          <DialogDescription>
            Status awal transaksi akan menjadi{' '}
            <span className="font-medium text-yellow-600 dark:text-yellow-400">PENDING</span>.
          </DialogDescription>
        </DialogHeader>

        <DisbursementForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={createTransaction.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
