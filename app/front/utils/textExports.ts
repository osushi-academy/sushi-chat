const exportText = (title: string, body: string[]) => {
  const blob = new Blob(body, {
    type: 'text/plan',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${title}.txt`
  link.click()
}

export default exportText
