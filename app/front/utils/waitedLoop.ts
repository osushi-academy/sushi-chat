const waitedLoop = (
  milliseconds: number,
  maxCount: number,
  callback: () => void | boolean | Promise<void | boolean>,
) => {
  let count = 0
  const handler = async () => {
    const cancel = await callback()
    count += 1
    if (count >= maxCount || cancel) {
      return
    }
    setTimeout(handler, milliseconds)
  }
  const timer = setTimeout(handler, milliseconds)
  return () => clearInterval(timer)
}

export default waitedLoop

export const randomWaitedLoog = (
  milliseconds: number,
  maxDelay: number,
  maxCount: number,
  callback: () => void | boolean,
) =>
  waitedLoop(
    milliseconds,
    maxCount,
    () =>
      new Promise((resolve) =>
        setTimeout(() => {
          resolve(callback())
        }, Math.random() * 2 * maxDelay - maxDelay),
      ),
  )
