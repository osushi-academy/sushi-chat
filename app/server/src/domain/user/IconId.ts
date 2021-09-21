interface IconId extends Number {
  _iconIdBrand: string
}

export const NewIconId = (value: number): IconId => {
  if (value < 0 || value > 10) {
    throw new Error(`value(${value}) is invalid for IconId: out of 0 to 10.`)
  }
  return value as any
}

export default IconId
