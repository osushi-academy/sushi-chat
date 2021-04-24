const waitedLoop = (
  milliseconds: number,
  maxCount: number,
  callback: () => void | boolean
) => {
  let count = 0
  const timer = setInterval(() => {
    const cancel = callback()
    count += 1
    if (count >= maxCount || cancel) {
      clearInterval(timer)
    }
  }, milliseconds)
  return () => clearInterval(timer)
}

export default waitedLoop
