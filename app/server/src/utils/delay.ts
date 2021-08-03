/**
 * [second]秒間待つための関数
 *
 * @param second 待ち時間
 * @returns
 */
const delay = async (second: number) => new Promise(resolve => setTimeout(resolve, second))

export default delay