"use client"

import { useId } from "react"
import { Input } from "@/components/ui/input"

interface ComboboxInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Text input with a native suggestion dropdown (datalist) — lets the user pick
 * an existing value or type a brand new one, without pulling in a command-palette
 * dependency for a single-field autocomplete.
 */
export function ComboboxInput({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className,
}: ComboboxInputProps) {
  const listId = useId()

  return (
    <>
      <Input
        id={id}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        autoComplete="off"
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  )
}
