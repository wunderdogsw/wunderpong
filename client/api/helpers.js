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
