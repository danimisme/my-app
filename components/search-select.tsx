'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface SearchSelectItem<T extends string = string> {
  label: string
  value: T
}

export interface SearchSelectProps<T extends string = string> {
  items: SearchSelectItem<T>[]
  value: T
  onSelect: (value: T) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

export function SearchSelect<T extends string = string>({
  items,
  value,
  onSelect,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  emptyText = 'Tidak ditemukan.',
  className,
  disabled,
}: SearchSelectProps<T>) {
  const [open, setOpen] = useState(false)

  const selected = items.find(item => item.value === value)

  function handleSelect(itemValue: string) {
    onSelect(itemValue as T)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('justify-between font-normal', className)}
        >
          <span className={cn(!selected && 'text-muted-foreground')}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {items.map(item => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      'mr-2 size-3.5',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
