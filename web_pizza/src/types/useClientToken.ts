import { useState, useEffect } from 'react';

const setCookie = (name: string, value: string, options?: { maxAge?: number; path?: string }) => {
  if (typeof window === 'undefined') return;

  let cookieString = `${name}=${encodeURIComponent(value)}`;

  if (options?.maxAge) {
    cookieString += `; max-age=${options.maxAge}`;
  }

  if (options?.path) {
    cookieString += `; path=${options.path}`;
  }

  // Adicionar samesite para segurança
  cookieString += `; SameSite=Strict`;

  document.cookie = cookieString;
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  }
  return null;
};

const generateClientToken = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  const sessionId = Math.random().toString(36).substr(2, 5);
  return `client_${timestamp}_${random}_${sessionId}`.replace(/[^a-zA-Z0-9_]/g, '');
};

export const useClientToken = (tableNumber?: string) => {
  const [clientToken, setClientToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getOrCreateToken = (): string => {
      if (!tableNumber || tableNumber === 'TAKEAWAY') {
        // Para takeaway, usa token genérico
        const genericToken = getCookie('@servFixe.clientToken_generic');
        if (genericToken) return genericToken;
        
        const newToken = generateClientToken();
        setCookie('@servFixe.clientToken_generic', newToken, {
          maxAge: 60 * 60 * 24 * 30, // 30 dias
          path: "/"
        });
        return newToken;
      }

      // Para mesa específica
      const cookieName = `@servFixe.clientToken_mesa_${tableNumber}`;
      let token = getCookie(cookieName);

      if (!token) {
        token = generateClientToken();
        setCookie(cookieName, token, {
          maxAge: 60 * 60 * 24 * 30, // 30 dias
          path: "/"
        });
      }

      return token;
    };

    const token = getOrCreateToken();
    setClientToken(token);
    setIsLoading(false);
  }, [tableNumber]);

  return { clientToken, isLoading };
};