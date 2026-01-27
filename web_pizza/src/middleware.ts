// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Definir os tipos de roles
type UserRole = 'Super Admin' | 'Admin' | 'Garçon' | 'Caixa'

// Mapeamento de permissões por rota
const routePermissions: Record<string, UserRole[]> = {
  // Rotas específicas PRIMEIRO
  '/dashboard/caixa': ['Super Admin', 'Admin', 'Caixa'],
  '/dashboard/bar': ['Super Admin', 'Admin','Garçon'],
  '/dashboard/cozinha': ['Super Admin', 'Admin','Garçon'],
  '/dashboard/stock': ['Super Admin', 'Admin'],
  '/dashboard/compra': ['Super Admin', 'Admin'],
  '/dashboard/igredient': ['Super Admin', 'Admin'],
  '/dashboard/products': ['Super Admin', 'Admin'],
  '/dashboard/settings': ['Super Admin', 'Admin'],
  '/dashboard/mesa': ['Super Admin', 'Admin'],
  '/dashboard/users': ['Super Admin'],
  
  // Rota geral DEPOIS
  '/dashboard': ['Super Admin', 'Admin'],
  '/cardapio': ['Super Admin', 'Admin'],
}

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('@servFixe.token')?.value
  const userRole = request.cookies.get('@servFixe.role')?.value as UserRole
  const pathname = request.nextUrl.pathname

  // Rotas protegidas - CORRIGIDO: todas com / no início
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/caixa', // ← CORRIGIDO: estava 'dashboard/caixa' (sem /)
    '/cardapio'
  ]

  // Rotas públicas que não devem ser acessadas quando logado
  const authRoutes = [
    '/login',
    '/register',
    '/activate'
    // REMOVIDO: '/cardapio/:path*' - isso não funciona no middleware
  ]

  // Rotas públicas que podem ser acessadas mesmo quando logado
  const publicRoutes = [
    '/',
    '/menu',
    '/menu/:path*'
  ]

  // Verifica se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname.startsWith(route)
  )

  // Verifica se é uma rota de autenticação (login, register, etc)
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Verifica se é uma rota pública geral
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // DEBUG
  console.log('🔐 Middleware:', {
    pathname,
    hasToken: !!currentUser,
    userRole,
    isProtectedRoute,
    isAuthRoute
  })

  // Se tentar acessar rota protegida sem estar autenticado
  if (isProtectedRoute && !currentUser) {
    console.log('🔒 Redirecting to login - No token')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Se tentar acessar rota de autenticação já estando logado
  if (isAuthRoute && currentUser) {
    console.log('🔄 Redirecting to dashboard - Already logged in')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // VERIFICAÇÃO DE ROLE PARA ROTAS PROTEGIDAS
  if (isProtectedRoute && currentUser && userRole) {
    // Encontrar a rota correspondente nas permissões (mais específica primeiro)
    let matchedRoute: string | undefined
    
    for (const route of Object.keys(routePermissions)) {
      if (pathname.startsWith(route)) {
        matchedRoute = route
        break // Usa a primeira (mais específica) correspondência
      }
    }

    console.log('🎯 Route Match:', { matchedRoute, userRole })

    if (matchedRoute) {
      const allowedRoles = routePermissions[matchedRoute]
      console.log('👥 Allowed Roles:', allowedRoles)
      
      // Se o usuário não tem permissão para acessar esta rota
      if (!allowedRoles.includes(userRole)) {
        console.log('🚫 Access Denied - Redirecting to unauthorized')
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      } else {
        console.log('✅ Access Granted')
      }
    } else {
      console.log('⚠️ No specific route matched')
    }
  }

  // Para rotas públicas (/ e /menu), sempre permite acesso, mesmo logado
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Se não é nenhuma das rotas definidas, permite acesso
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}