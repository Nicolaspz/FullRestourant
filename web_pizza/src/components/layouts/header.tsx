import Link from "next/link"
import { Button } from "@/components/ui/button"
import LoginButton from "@/components/auth/LoginButton"
import { Menu } from "lucide-react"
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import logoImg from '../../../public/Logo.png';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Azul primário com hover mais escuro */}
          <Link 
            href="/" 
            className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
           <div className="flex items-center space-x-2">
            <Image 
              src={logoImg} 
              alt="ServeFixe" 
              width={60}
              height={60}
              priority
            />
          </div>
          </Link>

          {/* Menu Desktop - Cinza médio com hover azul */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="#recursos" 
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Sobre
            </Link>
          
            <Link 
              href="/docoment" 
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Planos
            </Link>
            
            <Link 
              href="/docoment" 
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Contactos
            </Link>
          </nav>

          {/* Login Button - Estilo consistente */}
          <div className="hidden md:flex items-center space-x-4">
            <LoginButton />
          </div>

          {/* Mobile Menu - Ícone cinza com hover azul */}
          <div className="md:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-white shadow-lg border border-gray-200"
              >
                <DropdownMenuItem 
                  asChild
                  className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                >
                  <Link href="/features">Recursos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  asChild
                  className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                >
                  <Link href="/pricing">Preços</Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  asChild
                  className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                >
                  <Link href="/docs">Documentação</Link>
                </DropdownMenuItem>
                <div className="px-2 py-1.5 border-t border-gray-100">
                  <LoginButton mobile />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}