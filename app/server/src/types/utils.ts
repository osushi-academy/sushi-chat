export type PartiallyPartial<
  T extends Record<string | number | symbol, unknown>,
  PartialKey extends keyof T,
> = Partial<Pick<T, PartialKey>> & Pick<T, Exclude<keyof T, PartialKey>>
