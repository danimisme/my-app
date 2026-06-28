import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/app/(dashboard)/disbursements/components/StatusBadge'

describe('StatusBadge', () => {
  it('PENDING → teks "Menunggu" dan class kuning', () => {
    render(<StatusBadge status="PENDING" />)
    const badge = screen.getByTestId('status-badge')

    expect(badge).toHaveTextContent('Menunggu')
    expect(badge).toHaveClass('bg-yellow-100')
    expect(badge).toHaveClass('text-yellow-700')
  })

  it('SUCCESS → teks "Sukses" dan class hijau', () => {
    render(<StatusBadge status="SUCCESS" />)
    const badge = screen.getByTestId('status-badge')

    expect(badge).toHaveTextContent('Sukses')
    expect(badge).toHaveClass('bg-green-100')
    expect(badge).toHaveClass('text-green-700')
  })

  it('FAILED → teks "Gagal" dan class merah', () => {
    render(<StatusBadge status="FAILED" />)
    const badge = screen.getByTestId('status-badge')

    expect(badge).toHaveTextContent('Gagal')
    expect(badge).toHaveClass('bg-red-100')
    expect(badge).toHaveClass('text-red-700')
  })

  it('APPROVED → teks "Disetujui" dan class biru', () => {
    render(<StatusBadge status="APPROVED" />)
    const badge = screen.getByTestId('status-badge')

    expect(badge).toHaveTextContent('Disetujui')
    expect(badge).toHaveClass('bg-blue-100')
    expect(badge).toHaveClass('text-blue-700')
  })

  it('menerima className tambahan tanpa menghapus class status', () => {
    render(<StatusBadge status="SUCCESS" className="custom-class" />)
    const badge = screen.getByTestId('status-badge')

    expect(badge).toHaveClass('custom-class')
    expect(badge).toHaveClass('bg-green-100')
  })

  it('menyertakan data-status attribute sesuai status', () => {
    render(<StatusBadge status="FAILED" />)
    expect(screen.getByTestId('status-badge')).toHaveAttribute('data-status', 'FAILED')
  })
})
