import { describe, it, expect } from 'vitest'
import { calculateAdminFee } from '@/app/(dashboard)/disbursements/components/DisbursementForm'

describe('calculateAdminFee', () => {
  // ── Tier bawah (< 5.000.000) ─────────────────────────────────────────────

  it('mengembalikan 2500 untuk amount 1 (minimum valid)', () => {
    expect(calculateAdminFee(1)).toBe(2_500)
  })

  it('mengembalikan 2500 untuk amount 10.000', () => {
    expect(calculateAdminFee(10_000)).toBe(2_500)
  })

  it('mengembalikan 2500 untuk amount tepat di bawah batas (4.999.999)', () => {
    expect(calculateAdminFee(4_999_999)).toBe(2_500)
  })

  // ── Boundary (= 5.000.000) ────────────────────────────────────────────────

  it('mengembalikan 5000 untuk amount tepat di batas (5.000.000)', () => {
    expect(calculateAdminFee(5_000_000)).toBe(5_000)
  })

  // ── Tier atas (>= 5.000.000) ──────────────────────────────────────────────

  it('mengembalikan 5000 untuk amount 5.000.001', () => {
    expect(calculateAdminFee(5_000_001)).toBe(5_000)
  })

  it('mengembalikan 5000 untuk amount besar (100.000.000)', () => {
    expect(calculateAdminFee(100_000_000)).toBe(5_000)
  })

  // ── Input tidak valid ─────────────────────────────────────────────────────

  it('throw error untuk amount 0', () => {
    expect(() => calculateAdminFee(0)).toThrow('Amount harus lebih dari 0')
  })

  it('throw error untuk amount negatif (-1)', () => {
    expect(() => calculateAdminFee(-1)).toThrow('Amount harus lebih dari 0')
  })

  it('throw error untuk amount negatif besar (-999.999)', () => {
    expect(() => calculateAdminFee(-999_999)).toThrow('Amount harus lebih dari 0')
  })
})
