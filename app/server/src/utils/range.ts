/**
 * [0, 1, 2, ..., n]という配列を作る関数
 *
 * @param count 要素の数
 * @returns 配列
 */
export const ArrayRange = (count: number) =>  [...Array(count)].map((_, i) => i)