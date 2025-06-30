'use client'

import { useState, useEffect } from 'react'
import { Camera, Package, Bell, Settings } from 'lucide-react'
import { CameraCapture } from '@/components/camera/CameraCapture'
import { OCRResultModal } from '@/components/ocr/OCRResultModal'
import { PurchaseHistorySection } from '@/components/purchase/PurchaseHistorySection'
import { useAppStore, initializeSampleData } from '@/lib/stores/app-store'
import { ocrService } from '@/lib/ocr'
import { getDaysUntilEmpty, getStatusFromDaysLeft } from '@/lib/utils'

interface ReminderData {
  id: string
  productName: string
  daysLeft: number
  status: 'ok' | 'warning' | 'urgent'
  reminderDate: Date
  productId: string
}

export default function HomePage() {
  const { products, reminders } = useAppStore()
  const [showCamera, setShowCamera] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  const [todayReminders, setTodayReminders] = useState<ReminderData[]>([])
  const [isLoadingReminders, setIsLoadingReminders] = useState(true)
  const [ocrResult, setOcrResult] = useState<any>(null)
  const [saveResult, setSaveResult] = useState<any>(null)
  const [showOCRResult, setShowOCRResult] = useState(false)

  // リマインダーを取得
  const fetchReminders = async () => {
    try {
      setIsLoadingReminders(true)
      const response = await fetch('/api/reminders')
      if (response.ok) {
        const data = await response.json()
        setTodayReminders(data)
      }
    } catch (error) {
      console.error('Failed to fetch reminders:', error)
    } finally {
      setIsLoadingReminders(false)
    }
  }

  // サンプルデータを初期化してリマインダーを取得
  useEffect(() => {
    const initializeData = async () => {
      if (products.length === 0) {
        initializeSampleData()
      }
      
      // デモデータがない場合はシードデータを作成
      try {
        await fetch('/api/seed', { method: 'POST' })
      } catch (error) {
        console.error('Failed to seed data:', error)
      }
      
      await fetchReminders()
    }
    
    initializeData()
  }, [products.length])

  const getStatusColor = (status: 'ok' | 'warning' | 'urgent') => {
    switch (status) {
      case 'urgent': 
        return {
          textColor: 'var(--color-danger)',
          backgroundColor: 'rgba(255, 59, 48, 0.1)',
          borderColor: 'rgba(255, 59, 48, 0.2)'
        }
      case 'warning': 
        return {
          textColor: 'var(--color-warning)',
          backgroundColor: 'rgba(255, 149, 0, 0.1)',
          borderColor: 'rgba(255, 149, 0, 0.2)'
        }
      default: 
        return {
          textColor: 'var(--color-secondary)',
          backgroundColor: 'rgba(52, 199, 89, 0.1)',
          borderColor: 'rgba(52, 199, 89, 0.2)'
        }
    }
  }

  const handleCameraCapture = async (imageData: string) => {
    setIsProcessing(true)
    setProcessingMessage('レシートを解析中...')
    
    try {
      // OCR処理とデータ保存を実行
      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData })
      })
      
      if (!response.ok) {
        throw new Error('OCR処理に失敗しました')
      }
      
      const result = await response.json()
      
      setProcessingMessage(`${result.saveResult.savedProducts}個の商品を保存しました`)
      
      // OCR結果をストアに保存（後方互換性のため）
      useAppStore.getState().setOCRResult(result.ocrResult)
      
      // 結果を状態に保存
      setOcrResult(result.ocrResult)
      setSaveResult(result.saveResult)
      
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingMessage('')
        setShowCamera(false)
        setShowOCRResult(true)
        // リマインダーを再取得
        fetchReminders()
      }, 1000)
      
    } catch (error) {
      console.error('OCR処理エラー:', error)
      setProcessingMessage('OCR処理に失敗しました')
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingMessage('')
      }, 2000)
    }
  }

  const handleCompleteReminder = async (id: string) => {
    try {
      setIsProcessing(true)
      setProcessingMessage('リマインダーを完了中...')
      
      const response = await fetch(`/api/reminders/${id}/complete`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // リマインダーリストを再取得
        await fetchReminders()
        setProcessingMessage('リマインダーを完了しました')
        setTimeout(() => {
          setIsProcessing(false)
          setProcessingMessage('')
        }, 1000)
      } else {
        throw new Error('Failed to complete reminder')
      }
    } catch (error) {
      console.error('Failed to complete reminder:', error)
      setProcessingMessage('完了処理に失敗しました')
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingMessage('')
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-gray-50)' }}>
      {/* ヘッダー */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-primary mb-2">Easy Reminder</h1>
            <p className="text-lg" style={{ color: 'var(--color-gray-600)' }}>
              日用品の買い忘れを防ぐスマートなリマインダー
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 pb-32">
        {/* 処理中の表示 */}
        {isProcessing && (
          <div className="mb-8 card-modern p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin h-6 w-6 border-3 rounded-full" 
                   style={{ 
                     borderColor: 'var(--color-primary)',
                     borderTopColor: 'transparent'
                   }}></div>
              <p className="text-lg font-medium" style={{ color: 'var(--color-primary)' }}>
                {processingMessage}
              </p>
            </div>
          </div>
        )}

        {/* 今日のリマインダー */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center" style={{ color: 'var(--color-gray-900)' }}>
            <Bell className="mr-3 h-6 w-6" style={{ color: 'var(--color-primary)' }} />
            今日のリマインダー
          </h2>
          
          {isLoadingReminders ? (
            <div className="text-center py-16 card-modern">
              <div className="animate-spin h-8 w-8 mx-auto mb-4 border-3 rounded-full" 
                   style={{ 
                     borderColor: 'var(--color-primary)',
                     borderTopColor: 'transparent'
                   }}></div>
              <p className="text-lg" style={{ color: 'var(--color-gray-500)' }}>
                リマインダーを読み込み中...
              </p>
            </div>
          ) : todayReminders.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {todayReminders.map((reminder) => {
                const statusStyle = getStatusColor(reminder.status)
                return (
                  <div
                    key={reminder.id}
                    className="card-modern p-6"
                    style={{
                      backgroundColor: statusStyle.backgroundColor,
                      borderColor: statusStyle.borderColor
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2" style={{ color: statusStyle.textColor }}>
                          {reminder.productName}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--color-gray-600)' }}>
                          {reminder.status === 'urgent' && reminder.daysLeft > 0 
                            ? `${reminder.daysLeft}日経過` 
                            : reminder.daysLeft === 0 
                              ? '今日切れる予定' 
                              : `あと ${reminder.daysLeft} 日`}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCompleteReminder(reminder.id)}
                      className="w-full py-2 px-4 bg-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                      style={{ 
                        color: statusStyle.textColor,
                        border: `1px solid ${statusStyle.borderColor}`
                      }}
                    >
                      完了
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 card-modern">
              <Bell className="mx-auto h-16 w-16 mb-4" style={{ color: 'var(--color-gray-400)' }} />
              <p className="text-lg" style={{ color: 'var(--color-gray-500)' }}>
                今日のリマインダーはありません
              </p>
            </div>
          )}
        </section>

        {/* メインアクション */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-gray-900)' }}>
            主な機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* レシート撮影 */}
            <button 
              onClick={() => setShowCamera(true)}
              className="card-modern p-8 text-center transition-all duration-300 hover:scale-105 group"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 8px 32px rgba(0, 122, 255, 0.3)' }}>
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--color-gray-900)' }}>
                レシートを撮影
              </h3>
              <p className="text-base" style={{ color: 'var(--color-gray-600)' }}>
                買い物のレシートをスキャンして商品を自動で登録
              </p>
            </button>

            {/* 商品管理 */}
            <button 
              onClick={() => window.location.href = '/products'}
              className="card-modern p-8 text-center transition-all duration-300 hover:scale-105 group"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--color-secondary)', boxShadow: '0 8px 32px rgba(52, 199, 89, 0.3)' }}>
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--color-gray-900)' }}>
                商品を管理
              </h3>
              <p className="text-base" style={{ color: 'var(--color-gray-600)' }}>
                登録済み商品の確認・編集・削除
              </p>
            </button>
          </div>
        </section>

        {/* 最近の購入履歴 */}
        <PurchaseHistorySection />
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-around py-4">
            <button className="flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200"
                    style={{ 
                      backgroundColor: 'rgba(0, 122, 255, 0.1)',
                      color: 'var(--color-primary)'
                    }}>
              <Bell className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">ホーム</span>
            </button>
            <button 
              onClick={() => setShowCamera(true)}
              className="flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 hover:bg-gray-100"
              style={{ color: 'var(--color-gray-500)' }}
            >
              <Camera className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">撮影</span>
            </button>
            <button 
              onClick={() => window.location.href = '/products'}
              className="flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 hover:bg-gray-100"
              style={{ color: 'var(--color-gray-500)' }}
            >
              <Package className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">商品</span>
            </button>
            <button className="flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 hover:bg-gray-100"
                    style={{ color: 'var(--color-gray-500)' }}>
              <Settings className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">設定</span>
            </button>
          </div>
        </div>
      </nav>

      {/* カメラモーダル */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* OCR結果モーダル */}
      {showOCRResult && ocrResult && saveResult && (
        <OCRResultModal
          ocrResult={ocrResult}
          saveResult={saveResult}
          onClose={() => setShowOCRResult(false)}
          onSave={() => window.location.href = '/products'}
        />
      )}
    </div>
  )
} 
