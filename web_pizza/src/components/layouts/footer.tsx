import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Colunas de links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Produto</h3>
            <ul className="space-y-2">
              <li><Link href="/features" className="hover:text-gray-300">Recursos</Link></li>
              <li><Link href="/pricing" className="hover:text-gray-300">Preços</Link></li>
            </ul>
          </div>
          
          {/* Outras colunas... */}
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p>© {new Date().getFullYear()} G-Corporate. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}