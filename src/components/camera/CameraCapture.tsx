'use client'

import { useCamera } from '@/hooks/useCamera'
import { useState } from 'react'
import { Camera, X, RotateCcw } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const { 
    videoRef, 
    canvasRef, 
    isStreaming, 
    error, 
    startCamera, 
    stopCamera, 
    capturePhoto 
  } = useCamera()
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const handleStartCamera = async () => {
    await startCamera()
  }

  const handleCapture = () => {
    const imageData = capturePhoto()
    if (imageData) {
      setCapturedImage(imageData)
    }
  }

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage)
      stopCamera()
      onClose()
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* ヘッダー */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex justify-between items-center text-white">
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50"
          >
            <X className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-medium">レシート撮影</h1>
          <div className="w-10" /> {/* スペーサー */}
        </div>
      </div>

      {/* カメラビュー */}
      <div className="relative h-full flex flex-col">
        {!isStreaming && !capturedImage && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              {error ? (
                <div className="mb-4">
                  <p className="text-red-400 mb-2">エラー: {error}</p>
                  <button
                    onClick={handleStartCamera}
                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    再試行
                  </button>
                </div>
              ) : (
                <div>
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">カメラを起動してください</p>
                  <button
                    onClick={handleStartCamera}
                    className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    カメラを起動
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ビデオプレビュー */}
        {isStreaming && !capturedImage && (
          <>
            <video
              ref={videoRef}
              className="flex-1 w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* 撮影ガイド */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white/50 rounded-lg w-80 h-60 relative">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-sm">
                  レシートをここに合わせてください
                </div>
              </div>
            </div>

            {/* 撮影ボタン */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <button
                onClick={handleCapture}
                className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:bg-gray-100 flex items-center justify-center"
              >
                <div className="w-12 h-12 bg-white rounded-full border-2 border-gray-400" />
              </button>
            </div>
          </>
        )}

        {/* 撮影した画像のプレビュー */}
        {capturedImage && (
          <>
            <img
              src={capturedImage}
              alt="撮影した画像"
              className="flex-1 w-full h-full object-cover"
            />
            
            {/* 確認・再撮影ボタン */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <button
                onClick={handleRetake}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
                <span>再撮影</span>
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                この画像を使用
              </button>
            </div>
          </>
        )}
      </div>

      {/* 隠しキャンバス */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
} 
