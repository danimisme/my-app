'use client'

import { useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { useUser } from '@/providers/user-provider'
import { useCreateTransaction } from '@/lib/api/hooks/transaction'
import { calculateAdminFee, DisbursementForm } from '../components/DisbursementForm'
import type { DisbursementFormValues } from '../components/DisbursementForm'

const ALLOWED_ROLES = ['operator', 'admin', 'superadmin']

export default function NewDisbursementPage() {
  const { role } = useUser()
  const router = useRouter()
  const createTransaction = useCreateTransaction()

  if (!ALLOWED_ROLES.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <ShieldAlert className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Anda tidak memiliki akses ke halaman ini.
        </p>
      </div>
    )
  }

  async function handleSubmit(values: DisbursementFormValues) {
    await createTransaction.mutateAsync({
      sender_name:    values.sender_name,
      account_number: values.account_number,
      bank:           values.bank,
      amount:         values.amount,
      admin_fee:      calculateAdminFee(values.amount),
      status:         'PENDING',
      note:           values.note ?? '',
    })
    router.push('/disbursements')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Buat Disbursement</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Isi form berikut untuk membuat transaksi disbursement baru. Status awal akan menjadi{' '}
          <span className="font-medium text-yellow-600">PENDING</span>.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <DisbursementForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/disbursements')}
          isSubmitting={createTransaction.isPending}
        />
      </div>
    </div>
  )
}
