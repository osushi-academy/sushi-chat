/**
 * [0, 1, 2, ..., n-1]という配列を作る関数
 *
 * @param n 要素の数
 * @returns number[]
 */
export const ArrayRange = (n: number) => [...Array(n)].map((_, i) => i)
