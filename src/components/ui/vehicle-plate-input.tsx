import { Input } from '@/components/ui/input'
import { joinPlateValue, parsePlateValue, type PlateParts } from '@/lib/forms'

type VehiclePlateInputProps = {
  value: string
  onChange: (value: string) => void
}

export function VehiclePlateInput({ value, onChange }: VehiclePlateInputProps) {
  const parts = parsePlateValue(value)

  const updatePart = (key: keyof PlateParts, nextValue: string) => {
    const nextParts: PlateParts = {
      ...parts,
      [key]:
        key === 'country' || key === 'letters'
          ? nextValue.toUpperCase().replace(/[^A-ZА-Я]/g, '')
          : nextValue.replace(/\D/g, ''),
    }

    onChange(joinPlateValue(nextParts))
  }

  return (
    <div className="grid grid-cols-[72px_1fr_1fr_72px] gap-2">
      <Input
        value={parts.country}
        onChange={(event) => updatePart('country', event.target.value.slice(0, 2))}
        maxLength={2}
        placeholder="KZ"
        className="px-3 text-center uppercase"
      />
      <Input
        value={parts.numbers}
        onChange={(event) => updatePart('numbers', event.target.value.slice(0, 3))}
        maxLength={3}
        placeholder="111"
        className="px-3 text-center"
        inputMode="numeric"
      />
      <Input
        value={parts.letters}
        onChange={(event) => updatePart('letters', event.target.value.slice(0, 2))}
        maxLength={2}
        placeholder="AB"
        className="px-3 text-center uppercase"
      />
      <Input
        value={parts.region}
        onChange={(event) => updatePart('region', event.target.value.slice(0, 2))}
        maxLength={2}
        placeholder="01"
        className="px-3 text-center"
        inputMode="numeric"
      />
    </div>
  )
}
