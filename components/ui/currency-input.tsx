'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface CurrencyInputProps
  extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type'> {
  value?: number
  onChange?: (value: number) => void
  prefix?: string
}

function toDisplay(num: number): string {
  if (!num) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

function toRaw(str: string): number {
  const digits = str.replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export function CurrencyInput({
  value = 0,
  onChange,
  prefix = 'Rp',
  className,
  ...props
}: CurrencyInputProps) {
  const [display, setDisplay] = React.useState(() => toDisplay(value))
  // track last numeric value to distinguish external resets from internal edits
  const lastRawRef = React.useRef(value)

  React.useEffect(() => {
    if (value !== lastRawRef.current) {
      lastRawRef.current = value
      setDisplay(toDisplay(value))
    }
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = toRaw(e.target.value)
    lastRawRef.current = raw
    setDisplay(toDisplay(raw))
    onChange?.(raw)
  }

  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="pointer-events-none absolute left-3 select-none text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      <input
        {...props}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent py-1 pr-3 text-sm shadow-xs transition-colors',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          prefix ? 'pl-8' : 'pl-3',
          className
        )}
      />
    </div>
  )
}
