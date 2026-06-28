export const formatRupiah = (amount: number): string =>
  `Rp. ${new Intl.NumberFormat('id-ID').format(amount)}`

export const formatDate = (isoString: string): string =>
  new Date(isoString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export const formatDateShort = (isoString: string): string =>
  new Date(isoString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
  })
