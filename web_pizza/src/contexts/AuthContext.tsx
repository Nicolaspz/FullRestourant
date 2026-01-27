'use client'
import { createContext, ReactNode, useState, useEffect, useCallback, Suspense } from "react";
import { destroyCookie, setCookie, parseCookies } from 'nookies'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { api } from '../services/apiClients';

type AuthContextData = {
  user: UserProps | null;
  isAuthenticated: boolean;
  signIn: (credentials: SignInProps) => Promise<void>;
  signOut: () => void;
  signUp: (credentials: SignUpProps) => Promise<void>;
}

type UserProps = {
  id?: string;
  name?: string;
  email?: string;
  token?: string;
  role?: string;
  telefone?: string;
  organizationId?: string;
  user_name?: string;
  address?: string | null;
  imageLogo?: string | null;
  nif?: string | null;
  activeLicense?: string | boolean | null;
  name_org?: string;
  margin_stock?:string;
  margin_dish?:string;
}

type SignInProps = {
  credential: string;
  password: string;
}

type SignUpProps = {
  id: string;
  name: string;
  email: string;
  role: string;
  telefone: string;
  organizationId: string;
  user_name: string;
  address?: string,
  imageLogo: string,
  nif: string,
  activeLicense: string,
  name_org: string
}

type AuthProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserProps | null>(null);
  const isAuthenticated = !!user?.token;

  const inactivityTimeout = 15 * 60 * 1000;
  let inactivityTimer: NodeJS.Timeout;

  function signOut() {
    try {
      // Limpa todos os cookies de forma mais agressiva
      destroyCookie(undefined, '@servFixe.token', { path: '/' })
      destroyCookie(undefined, '@servFixe.role', { path: '/' })
      
      // Limpa também via document.cookie para garantir
      document.cookie = '@servFixe.token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = '@servFixe.role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      
      // Limpa o estado do usuário
      setUser(null)
      
      // Limpa o header de autorização da API
      delete api.defaults.headers['Authorization']
      
      console.log('🚪 Logout realizado - cookies limpos')
      
      // Redireciona para login
      router.push('/login')
      
      // Força um reload para limpar completamente o estado
      setTimeout(() => {
        window.location.reload()
      }, 100)
      
    } catch (error) {
      console.error("Erro ao deslogar:", error)
      // Fallback: redireciona mesmo com erro
      router.push('/login')
    }
  }

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      signOut();
    }, inactivityTimeout);
  };

  const handleUserInteraction = () => {
    resetInactivityTimer();
  };

  const checkToken = useCallback(async () => {
    try {
      const { '@servFixe.token': token } = parseCookies();

      if (token) {
        api.defaults.headers['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/me');

        const { id, name, email, role, organizationId, user_name } = response.data;
        const orgData = response.data.Organization || {};
        
        setUser({
          id,
          name,
          email,
          role,
          user_name,
          token,
          organizationId,
          address: orgData.address || null,
          imageLogo: orgData.imageLogo || null,
          nif: orgData.nif || null,
          activeLicense: orgData.activeLicense || null,
          name_org: orgData.name || ''
        });

        console.log("user refres", user);
      }
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      signOut();
    }
  }, []);

  useEffect(() => {
    checkToken();

    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('mousedown', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    resetInactivityTimer();

    return () => {
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('mousedown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      clearTimeout(inactivityTimer);
    };
  }, [checkToken]);

  async function signIn({ credential, password }: SignInProps) {
    try {
      const response = await api.post('/session', { credential, password });
      const { id, name, email, role, organizationId, user_name, token } = response.data;
      const orgData = response.data.Organization || {};
      
      toast.success("Login feito com sucesso!");

      // Salva token e role nos cookies
      setCookie(undefined, '@servFixe.token', token, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/"
      });
      setCookie(undefined, '@servFixe.role', role, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/"
      })

      // Atualiza estado com user + token
      setUser({
        id,
        name,
        email,
        role,
        user_name,
        token,
        organizationId,
        address: orgData.address || null,
        imageLogo: orgData.imageLogo || null,
        nif: orgData.nif || null,
        activeLicense: orgData.activeLicense || null,
        name_org: orgData.name || ''
      });

      console.log("logado", response.data.user)
      
      // Redireciona baseado na role
      if (role === 'Caixa') {
        router.push("/dashboard/caixa");
      } else if (role === 'Garçon') {
        router.push("/dashboard/bar");
      } else {
        router.push("/dashboard");
      }
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro inesperado, tente novamente.";
      toast.error(errorMessage);
    }
  }

  async function signUp({ name, email, role, user_name }: SignUpProps) {
    try {
      await api.post('/users', {
        name,
        email,
        role,
        user_name
      });

      toast.success("Cadastrado com sucesso!");
      router.push('/sign-in');
    } catch (err) {
      toast.error("Erro ao se Cadastrar");
    }
  }

  return (
    <Suspense>
      <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, signUp }}>
        {children}
      </AuthContext.Provider>
    </Suspense>
  )
}