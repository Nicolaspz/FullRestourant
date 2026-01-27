// services/api.ts
import axios, { AxiosError } from 'axios'
import { destroyCookie, parseCookies } from 'nookies'
import { AuthTokenError } from './errors/AuthTokenError'

function signOut() {
  try {
    destroyCookie(undefined, '@servFixe.token')
  } catch {
    // erro ao deslogar
  }
}

// Função para determinar a URL base dinamicamente
const getBaseUrl = () => {
  // Se tiver variável de ambiente, usa ela
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // No navegador
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    
    // Se for localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3333';
    }
    
    // Se for um IP (celular na rede)
    return `http://${hostname}:3333`;
  }
  
  // Fallback padrão
  return 'http://localhost:3333';
}

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);
  
  const api = axios.create({
    baseURL: getBaseUrl(), // ⬅️ CORREÇÃO AQUI!
    headers: {
      Authorization: `Bearer ${cookies['@servFixe.token']}`
    }
  })

  api.interceptors.response.use(response => {
    return response;
  }, (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window === 'undefined') {
        return Promise.reject(new AuthTokenError());
      } else {
        signOut()
      }
    }
    return Promise.reject(error);
  })

  return api;
}