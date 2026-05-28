"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import { getAllLucideIconNames, getIcon } from "@/lib/project-utils"

const allIconNames = getAllLucideIconNames()

export default function IconPickerField({
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
      <Combobox
        disabled={disabled}
        items={[
          { id: "__none__", name: "None" },
          ...allIconNames.map((name) => ({ id: name, name })),
        ]}
        value={value || undefined}
        onValueChange={(nextValue) => {
          const selectedValue = Array.isArray(nextValue)
            ? nextValue[0]
            : nextValue

          onChange(selectedValue === "__none__" ? "" : selectedValue ?? "")
        }}
      >
        <ComboboxInput
          id={id}
          placeholder="Select a Lucide icon"
          disabled={disabled}
          showClear
        />
        <ComboboxContent>
          <ComboboxEmpty>No icons found.</ComboboxEmpty>
          <ComboboxList>
            {({ id: itemId, name }) => {
              if (itemId === "__none__") {
                return (
                  <ComboboxItem key={itemId} value={name}>
                    None
                  </ComboboxItem>
                )
              }

              const Icon = getIcon(name)
              return (
                <ComboboxItem key={itemId} value={name}>
                  {Icon ? (
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  ) : null}
                  {name}
                </ComboboxItem>
              )
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
