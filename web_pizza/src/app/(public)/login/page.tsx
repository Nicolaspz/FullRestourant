"use client";

import { useState, useContext } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, Eye, EyeOff, Mail } from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
import { api } from "@/services/apiClients";
import { toast } from "react-toastify";

export default function LoginPage() {
  const { signIn } = useContext(AuthContext);
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false); // controla login vs recuperar senha

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn({ credential, password });
    } catch (err) {
      console.error("Erro ao logar:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { credential });
      toast.success("Enviamos um link de recuperação para o seu email.");
      setForgotMode(false); // volta para tela de login
    } catch (err) {
      toast.error("Erro ao enviar email de recuperação.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 rounded-xl shadow-lg">
        {!forgotMode ? (
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 rounded-full bg-blue-100">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-center text-gray-800">
                Acesse sua conta
              </h1>
              <p className="text-sm text-gray-600 text-center">
                Entre para gerenciar seus pagamentos
              </p>
            </div>

            {/* Campos */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="seu@email.com"
                  className="h-11"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                    onClick={() => setForgotMode(true)}
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </div>

              {/* Botão de login */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </div>
          </form>
        ) : (
          // Formulário de recuperar senha
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 rounded-full bg-blue-100">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-center text-gray-800">
                Recuperar Senha
              </h1>
              <p className="text-sm text-gray-600 text-center">
                Informe seu email para receber o link de redefinição
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="h-11"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Voltar ao login
                </button>
              </div>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
