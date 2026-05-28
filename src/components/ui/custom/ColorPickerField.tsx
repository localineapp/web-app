"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Shuffle, Trash2Icon } from "lucide-react"
import { normalizeHexColor } from "@/lib/project-utils"

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
  const [colorInputValue, setColorInputValue] = useState("#FFFFFF")
  const [hexInputValue, setHexInputValue] = useState("")

  useEffect(() => {
    const normalizedValue = normalizeHexColor(value)
    setHexInputValue(normalizedValue || "")
    setColorInputValue(normalizedValue || "#FFFFFF")
  }, [value])

  function handleHexInputChange(nextValue: string) {
    setHexInputValue(nextValue)

    const normalizedValue = normalizeHexColor(nextValue)
    if (normalizedValue || nextValue.trim() === "") {
      onChange(normalizedValue || "")
      setColorInputValue(normalizedValue || "#FFFFFF")
    }
  }

  function handleColorInputChange(nextValue: string) {
    const normalizedValue = normalizeHexColor(nextValue)
    setColorInputValue(normalizedValue || "#FFFFFF")
    setHexInputValue(normalizedValue || "")
    onChange(normalizedValue || "")
  }

  function handleReset() {
    setHexInputValue("")
    setColorInputValue("#FFFFFF")
    onChange("")
  }

  function handleRandomColor() {
    const rand = `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()}`
    const normalized = normalizeHexColor(rand)
    setHexInputValue(normalized || "")
    setColorInputValue(normalized || "#FFFFFF")
    onChange(normalized || "")
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="color"
          className="h-8 w-14 cursor-pointer overflow-hidden rounded-md border p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:border-0"
          value={colorInputValue}
          disabled={disabled}
          onChange={({ target: { value: nextValue } }) =>
            handleColorInputChange(nextValue)
          }
        />
        <Input
          value={hexInputValue}
          placeholder="#RRGGBB"
          spellCheck={false}
          autoComplete="off"
          className="min-w-0 flex-1 font-mono uppercase"
          disabled={disabled}
          onChange={({ target: { value: nextValue } }) =>
            handleHexInputChange(nextValue)
          }
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          disabled={disabled}
          onClick={handleRandomColor}
          aria-label="Random color"
        >
          <Shuffle className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          disabled={disabled || !value}
          onClick={handleReset}
          aria-label="Reset color"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
