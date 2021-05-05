export type HSLColor = {
  h: number
  s: number
  l: number
}

// export const getRandomColor = (colorSequence: number): HSLColor => {
//   const h = (colorSequence * 4) % 100
//   return { h: h < 50 ? h : 100 - h, s: 80, l: 60 }
// }

export const getRandomColor = (): HSLColor => {
  const h = Math.random() * 360 * 2 - 360
  return {
    h,
    s: 70,
    l: 65,
  }
}
