export const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: {
      'Content-type': 'application/json',
    },
    ...options,
  })
  if (res.status >= 300) {
    throw new Error(res.statusText)
  }
  return await res.json()
}

export const sanitizeName = name => name
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9 ]/gi, '')
  .replace(/[ ]{1,}/gi, '_')
