interface IconId extends String {
  _iconIdBrand: string
}

export const NewIconId = (value: string): IconId => {
  const valueInt = parseInt(value)
  if (valueInt < 0 || valueInt > 10) {
    throw new Error(`value(${value}) is invalid for IconId: out of 0 to 10.`)
  }
  return value as any
}

export default IconId
