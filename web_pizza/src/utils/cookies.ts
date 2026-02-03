export const setCookie = (
  name: string,
  value: string,
  maxAgeSeconds = 60 * 60 * 24
) => {
  document.cookie = `${name}=${value}; max-age=${maxAgeSeconds}; path=/; SameSite=Strict`
}

export const getCookie = (name: string): string | null => {
  const match = document.cookie.match(
    new RegExp('(^| )' + name + '=([^;]+)')
  )
  return match ? match[2] : null
}
