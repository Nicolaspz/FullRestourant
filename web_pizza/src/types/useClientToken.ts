import { useEffect, useState } from 'react'
import { generateClientToken } from '@/utils/clientToken'
import { getCookie, setCookie } from '@/utils/cookies'

export const useClientToken = (tableNumber?: string) => {
  const [clientToken, setClientToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!tableNumber || typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const cookieName =
      tableNumber === 'TAKEAWAY'
        ? '@servFixe.clientToken_generic'
        : `@servFixe.clientToken_mesa_${tableNumber}`

    let token = getCookie(cookieName)

    // 🔥 SE NÃO EXISTIR → CRIA
    if (!token) {
      token = generateClientToken(tableNumber)
      setCookie(cookieName, token, 60 * 60 * 24)
      console.log('🆕 Token criado automaticamente:', token)
    }

    setClientToken(token)
    setIsLoading(false)
  }, [tableNumber])

  return { clientToken, isLoading }
}
