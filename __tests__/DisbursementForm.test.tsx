import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  DisbursementForm,
  disbursementSchema,
} from '@/app/(dashboard)/disbursements/components/DisbursementForm'

describe('DisbursementForm — validasi', () => {
  const mockSubmit = vi.fn()
  const mockCancel = vi.fn()

  beforeEach(() => vi.clearAllMocks())

  it('amount = 9999 → tampilkan error "Minimal Rp 10.000"', async () => {
    const user = userEvent.setup()
    render(<DisbursementForm onSubmit={mockSubmit} onCancel={mockCancel} />)

    const amountInput = screen.getByPlaceholderText('0')
    await user.clear(amountInput)
    await user.type(amountInput, '9999')

    await user.click(screen.getByRole('button', { name: /buat disbursement/i }))

    await waitFor(() => {
      expect(screen.getByText('Minimal Rp 10.000')).toBeInTheDocument()
    })
    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('account_number = "abc" → tampilkan error "Hanya boleh angka"', async () => {
    const user = userEvent.setup()
    render(<DisbursementForm onSubmit={mockSubmit} onCancel={mockCancel} />)

    await user.type(screen.getByPlaceholderText('Contoh: 1234567890'), 'abc')

    await user.click(screen.getByRole('button', { name: /buat disbursement/i }))

    await waitFor(() => {
      expect(screen.getByText('Hanya boleh angka')).toBeInTheDocument()
    })
    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('semua field valid → tidak ada error validasi', () => {
    const result = disbursementSchema.safeParse({
      sender_name: 'Budi Santoso',
      account_number: '1234567890',
      bank: 'BCA',
      amount: 50_000,
      date: new Date(),
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.error).toBeUndefined()
    }
  })
})
