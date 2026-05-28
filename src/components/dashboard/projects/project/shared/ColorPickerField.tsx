"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function toUpperHex(value: string): string {
  const normalizedValue = value.trim().toUpperCase()
  return /^#[0-9A-F]{6}$/.test(normalizedValue) ? normalizedValue : "#FFFFFF"
}

export default function ColorPickerField({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="color"
          className="h-8 w-14 p-1"
          value={toUpperHex(value)}
          disabled={disabled}
          onChange={({ target: { value: nextValue } }) =>
            onChange(toUpperHex(nextValue))
          }
        />
        <Input value={toUpperHex(value)} disabled readOnly className="font-mono" />
      </div>
    </div>
  )
}
