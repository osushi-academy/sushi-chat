/**
 * [second]秒間待つための関数
 *
 * @param ms 待ち時間[millisecond]
 * @returns
 */
const delay = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export default delay
