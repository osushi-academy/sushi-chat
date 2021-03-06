const SUSHI_CHAT_SELECTED_ICON_KEY = "SUSHI_CHAT_SELECTED_ICON_KEY"

export const getSelectedIconFromJSON = () => {
  const iconIdOrNull = localStorage.getItem(SUSHI_CHAT_SELECTED_ICON_KEY)
  if (iconIdOrNull == null) {
    return null
  } else {
    // stringをnumberに変換
    const iconId = Number(iconIdOrNull)
    return Number.isNaN(iconId) ? null : iconId
  }
}

export const setSelectedIconToJSON = (iconId: number) =>
  localStorage.setItem(SUSHI_CHAT_SELECTED_ICON_KEY, `${iconId}`)
