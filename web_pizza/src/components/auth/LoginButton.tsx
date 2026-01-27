import { Button } from "@/components/ui/button"

export default function LoginButton({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={`flex ${mobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
      <Button variant={mobile ? "default" : "secondary"} size={mobile ? "default" : "sm"} asChild>
        <a href="/login">Entrar</a>
      </Button>
      <Button size={mobile ? "default" : "sm"} asChild>
        <a href="/register">Criar conta</a>
      </Button>
    </div>
  )
}