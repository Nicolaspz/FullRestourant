export const generateClientToken = (mesa?: string) => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 9)

  return mesa
    ? `client_mesa_${mesa}_${timestamp}_${random}`
    : `client_${timestamp}_${random}`
}
