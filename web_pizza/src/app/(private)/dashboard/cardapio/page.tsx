// TableSelectionPage.tsx - ATUALIZADA COM LEITOR DE QR CODE NATIVO
"use client"
import { useState, useContext, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/contexts/AuthContext'
import { setupAPIClient } from '@/services/api' 
import { toast } from "react-toastify"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Utensils, QrCode, Camera, X } from 'lucide-react'

// Função para setar cookies (igual à que você já usa)
const setCookie = (name: string, value: string, options?: { maxAge?: number; path?: string }) => {
  let cookieString = `${name}=${value}`;
  
  if (options?.maxAge) {
    cookieString += `; max-age=${options.maxAge}`;
  }
  
  if (options?.path) {
    cookieString += `; path=${options.path}`;
  }
  
  document.cookie = cookieString;
};

const TableSelectionPage = () => {
  const [tableNumber, setTableNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [hasCameraSupport, setHasCameraSupport] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const router = useRouter()
  const { user } = useContext(AuthContext)
  const apiClient = setupAPIClient()

  // Verificar suporte à câmera e API de leitura de QR nativa
  useEffect(() => {
    const checkCameraSupport = async () => {
      if (typeof window !== 'undefined' && 
          'mediaDevices' in navigator && 
          'getUserMedia' in navigator.mediaDevices) {
        
        // Verificar também suporte a Barcode Detection API (nativa)
        if ('BarcodeDetector' in window) {
          setHasCameraSupport(true)
        } else {
          // Fallback: usar biblioteca JavaScript para leitura de QR
          try {
            // Verificar se podemos acessar a câmera
            const testStream = await navigator.mediaDevices.getUserMedia({ video: true })
            testStream.getTracks().forEach(track => track.stop())
            setHasCameraSupport(true)
          } catch {
            setHasCameraSupport(false)
            toast.warning('Seu navegador não suporta acesso à câmera para leitura de QR Code')
          }
        }
      }
    }
    
    checkCameraSupport()
    
    // Limpar stream ao desmontar componente
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Iniciar a câmera para leitura de QR Code
  const startQRScanner = async () => {
    if (!hasCameraSupport) {
      toast.warning('Seu navegador não suporta leitura de QR Code pela câmera')
      return
    }

    try {
      setShowQRScanner(true)
      setIsScanning(true)
      
      // Solicitar acesso à câmera traseira
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Usar câmera traseira
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      
      // Iniciar detecção de QR Code
      startQRDetection()
      
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
      toast.error('Não foi possível acessar a câmera. Verifique as permissões.')
      stopQRScanner()
    }
  }

  // Usar BarcodeDetector API nativa do navegador
  const startQRDetection = async () => {
    if (!('BarcodeDetector' in window)) {
      // Fallback: usar biblioteca jsQR (você precisaria instalar: npm install jsqr)
      useJsqrFallback()
      return
    }
    
    const barcodeDetector = new (window as any).BarcodeDetector({
      formats: ['qr_code']
    })
    
    const detectQR = async () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return
      
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(detectQR)
        return
      }
      
      // Configurar canvas com as mesmas dimensões do vídeo
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      try {
        const barcodes = await barcodeDetector.detect(canvas)
        
        if (barcodes.length > 0) {
          const qrData = barcodes[0].rawValue
          console.log('QR Code detectado:', qrData)
          
          // Processar o QR Code
          processQRCode(qrData)
          return // Parar a detecção
        }
      } catch (error) {
        console.error('Erro na detecção:', error)
      }
      
      // Continuar detecção
      if (isScanning) {
        requestAnimationFrame(detectQR)
      }
    }
    
    detectQR()
  }

  // Fallback usando jsQR (biblioteca JavaScript)
  const useJsqrFallback = async () => {
    // Esta é uma implementação simplificada
    // Você precisaria instalar e importar jsQR
    toast.info('Usando método alternativo para leitura de QR Code')
  }

  // Parar scanner de QR Code
  const stopQRScanner = () => {
    setIsScanning(false)
    setShowQRScanner(false)
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Processar QR Code lido
  const processQRCode = async (qrData: string) => {
    try {
      setIsLoading(true)
      stopQRScanner()
      
      console.log('📱 QR Code lido:', qrData)
      
      // Extrair organizationId e tableNumber da URL
      // Formato esperado: /dashboard/cardapio/{organizationId}/{tableNumber}
      const urlPattern = /\/dashboard\/cardapio\/([^\/]+)\/(\d+)/i
      const match = qrData.match(urlPattern)
      
      let extractedOrgId = user?.organizationId
      let extractedTableNumber = tableNumber
      
      if (match) {
        // QR Code contém URL completa
        extractedOrgId = match[1]
        extractedTableNumber = match[2]
      } else if (/^\d+$/.test(qrData)) {
        // QR Code contém apenas o número da mesa
        extractedTableNumber = qrData
      } else {
        throw new Error('Formato de QR Code não reconhecido')
      }
      
      // Verificar a mesa
      await verifyAndProceed(extractedTableNumber, extractedOrgId)
      
    } catch (error: any) {
      console.error('Erro ao processar QR Code:', error)
      toast.error(error.message || 'QR Code inválido')
      setIsLoading(false)
    }
  }

  // Função comum para verificar mesa e navegar
  const verifyAndProceed = async (tableNum: string, orgId?: string) => {
    try {
      const response = await apiClient.get(`/mesa_verify/${tableNum}`, {
        params: {
          organizationId: orgId || user?.organizationId
        },
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      })

      if (response.data.success) {
        console.log('✅ Mesa verificada com sucesso')
        
        // Gerar clientToken
        const timestamp = Date.now().toString(36)
        const random = Math.random().toString(36).substr(2, 9)
        const clientToken = `client_${tableNum}_${timestamp}_${random}`.replace(/[^a-zA-Z0-9_]/g, '')
        
        const cookieName = `@servFixe.clientToken_mesa_${tableNum}`
        
        // Salvar cookie
        setCookie(cookieName, clientToken, {
          maxAge: 60 * 60 * 24 * 30,
          path: "/"
        })
        
        // Navegar para o cardápio
        router.push(`/dashboard/cardapio/${orgId || user?.organizationId}/${tableNum}`)
      } else {
        toast.error(response.data.error || 'Mesa não encontrada')
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error('Erro ao verificar mesa:', error)
      toast.error(error.response?.data?.error || 'Erro ao verificar mesa')
      setIsLoading(false)
    }
  }

  // Manipular envio do formulário (entrada manual)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tableNumber.trim() || isNaN(Number(tableNumber))) {
      toast.warning('Por favor, informe um número de mesa válido')
      return
    }

    await verifyAndProceed(tableNumber)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Utensils className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Bem-vindo ao Cardápio</CardTitle>
          <CardDescription>
            {showQRScanner 
              ? 'Aponte a câmera para o QR Code da mesa' 
              : 'Informe o número da sua mesa ou escaneie o QR Code'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Scanner de QR Code */}
          {showQRScanner && (
            <div className="mb-6">
              <div className="relative rounded-lg overflow-hidden bg-black mb-4">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ display: 'none' }}
                />
                
                {/* Overlay com guia para QR Code */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-green-400 rounded-lg relative">
                    <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-green-400"></div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-green-400"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-green-400"></div>
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-green-400"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button
                  onClick={stopQRScanner}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                
                <Button
                  onClick={() => {
                    // Opcional: alternar entre câmeras
                    toast.info('Funcionalidade de alternar câmera em desenvolvimento')
                  }}
                  variant="ghost"
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Alternar Câmera
                </Button>
              </div>
              
              <p className="text-sm text-center text-gray-600 mt-4">
                Posicione o QR Code dentro do quadro para leitura automática
              </p>
            </div>
          )}
          
          {/* Formulário de entrada manual (mostrar apenas se não estiver escaneando) */}
          {!showQRScanner && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Número da Mesa</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  min="1"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Ex: 5"
                  required
                  autoFocus
                  className="text-center text-lg"
                />
              </div>
              
              <Button
                type="submit"
                disabled={!tableNumber.trim() || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Acessar Cardápio'
                )}
              </Button>
            </form>
          )}
          
          {/* Botão de alternância entre os modos */}
          <div className="mt-6 pt-6 border-t">
            {!showQRScanner ? (
              <Button
                onClick={startQRScanner}
                disabled={!hasCameraSupport || isLoading}
                variant="outline"
                className="w-full"
              >
                {hasCameraSupport ? (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Ler QR Code com a Câmera
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Câmera não disponível
                  </>
                )}
              </Button>
            ) : null}
          </div>
          
          {/* Informações sobre compatibilidade */}
          {!hasCameraSupport && !showQRScanner && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ Para ler QR Codes, use um navegador moderno como Chrome, Edge ou Safari em um dispositivo com câmera.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TableSelectionPage