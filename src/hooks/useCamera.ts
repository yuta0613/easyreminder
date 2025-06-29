import { useRef, useCallback, useState } from 'react'

export interface CameraHookResult {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  isStreaming: boolean
  error: string | null
  startCamera: () => Promise<void>
  stopCamera: () => void
  capturePhoto: () => string | null
}

export function useCamera(): CameraHookResult {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      
      // カメラのストリームを取得
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 背面カメラを優先
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsStreaming(true)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'カメラの起動に失敗しました'
      setError(errorMessage)
      console.error('Camera error:', err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsStreaming(false)
  }, [])

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) {
      return null
    }

    // キャンバスサイズを動画サイズに合わせる
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // 動画フレームをキャンバスに描画
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Base64形式のデータURLを返す
    return canvas.toDataURL('image/jpeg', 0.8)
  }, [isStreaming])

  return {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    capturePhoto
  }
} 
