export const formatDate = (date: Date) =>
  date.toISOString().replace(/T/, " ").replace(/\..+/, "")
