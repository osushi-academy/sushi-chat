export const formatDate = (date: Date) =>
  `${date.getFullYear()}/${
    date.getMonth() + 1
  }/${date.getDate()} ${date.getHours()}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`
