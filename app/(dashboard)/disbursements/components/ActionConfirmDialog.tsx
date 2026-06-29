import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export type ActionType = 'approve' | 'reject'

export interface PendingAction {
  id: string
  type: ActionType
}

interface ActionConfirmDialogProps {
  pending: PendingAction | null
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const CONFIG: Record<ActionType, { title: string; description: string; confirmLabel: string; confirmClass: string }> = {
  approve: {
    title: 'Setujui Transaksi?',
    description: 'Transaksi akan diubah menjadi SUKSES. Tindakan ini tidak dapat dibatalkan.',
    confirmLabel: 'Ya, Setujui',
    confirmClass: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600',
  },
  reject: {
    title: 'Tolak Transaksi?',
    description: 'Transaksi akan ditandai sebagai GAGAL. Tindakan ini tidak dapat dibatalkan.',
    confirmLabel: 'Ya, Tolak',
    confirmClass: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive',
  },
}

export function ActionConfirmDialog({ pending, isLoading, onConfirm, onCancel }: ActionConfirmDialogProps) {
  const cfg = pending ? CONFIG[pending.type] : null

  return (
    <AlertDialog open={!!pending} onOpenChange={open => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{cfg?.title}</AlertDialogTitle>
          <AlertDialogDescription>{cfg?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            className={cfg?.confirmClass}
            onClick={e => { e.preventDefault(); onConfirm() }}
          >
            {isLoading ? 'Memproses...' : cfg?.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
