import { ArgumentError } from "../../error"

const VALUE_MIN = 0
const VALUE_MAX = 11

interface IconId extends Number {
  _iconIdBrand: string
}

export const NewIconId = (value: number): IconId => {
  if (value < VALUE_MIN || value > VALUE_MAX) {
    throw new ArgumentError(
      `value(${value}) is invalid for IconId: out of ${VALUE_MIN} to ${VALUE_MAX}.`,
    )
  }
  return value as unknown as IconId
}

export default IconId
