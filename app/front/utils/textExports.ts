const exportText = (title: string, text: string[]) => {
  const bom = new Uint8Array([0xef, 0xbb, 0xbf])
  let body: any[] = [bom]
  body = body.concat(text)
  const blob = new Blob(body, {
    type: 'text/plain',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${title}.txt`
  link.click()
}

export default exportText
