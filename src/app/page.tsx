'use client'

import { useState, useEffect } from 'react'
import { Camera, Package, Bell, Settings } from 'lucide-react'
import { CameraCapture } from '@/components/camera/CameraCapture'
import { useAppStore, initializeSampleData } from '@/lib/stores/app-store'
import { ocrService } from '@/lib/ocr'
import { getDaysUntilEmpty, getStatusFromDaysLeft } from '@/lib/utils'

export default function HomePage() {
  const { products, reminders } = useAppStore()
  const [showCamera, setShowCamera] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')

  // サンプルデータを初期化
  useEffect(() => {
    if (products.length === 0) {
      initializeSampleData()
    }
  }, [products.length])

  // 今日のリマインダーを計算（サンプルデータに基づく）
  const todayReminders = [
    { id: 1, name: '衣料用洗剤', daysLeft: 2, status: 'warning' as const },
    { id: 2, name: '醤油', daysLeft: 0, status: 'urgent' as const },
    { id: 3, name: '歯磨き粉', daysLeft: 5, status: 'ok' as const },
  ]

  const getStatusColor = (status: 'ok' | 'warning' | 'urgent') => {
    switch (status) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const handleCameraCapture = async (imageData: string) => {
    setIsProcessing(true)
    setProcessingMessage('レシートを解析中...')
    
    try {
      // OCR処理を実行
      const result = await ocrService.processReceipt(imageData)
      
      setProcessingMessage(`${result.totalItems}個の商品を検出しました`)
      
      // OCR結果をストアに保存
      useAppStore.getState().setOCRResult(result)
      
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingMessage('')
        // 商品管理画面に遷移（将来の実装）
        alert(`OCR完了！${result.totalItems}個の商品が検出されました。`)
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

  const handleCompleteReminder = (id: number) => {
    alert(`リマインダー ${id} を完了しました`)
    // 実際の実装では、reminderのstatusを更新する
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Easy Reminder</h1>
          <p className="text-sm text-gray-600">日用品の買い忘れを防ぐスマートなリマインダー</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* 処理中の表示 */}
        {isProcessing && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="text-blue-800">{processingMessage}</p>
            </div>
          </div>
        )}

        {/* 今日のリマインダー */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            今日のリマインダー
          </h2>
          
          {todayReminders.length > 0 ? (
            <div className="space-y-3">
              {todayReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-lg border ${getStatusColor(reminder.status)}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{reminder.name}</h3>
                      <p className="text-sm opacity-75">
                        {reminder.daysLeft === 0 
                          ? '今日切れる予定' 
                          : `あと ${reminder.daysLeft} 日`}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleCompleteReminder(reminder.id)}
                      className="px-3 py-1 bg-white rounded-md border text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      完了
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="mx-auto h-12 w-12 opacity-50 mb-2" />
              <p>今日のリマインダーはありません</p>
            </div>
          )}
        </section>

        {/* メインアクション */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* レシート撮影 */}
            <button 
              onClick={() => setShowCamera(true)}
              className="p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Camera className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">レシートを撮影</h3>
              <p className="text-sm opacity-90">買い物のレシートをスキャンして商品を登録</p>
            </button>

            {/* 商品管理 */}
            <button className="p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Package className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">商品を管理</h3>
              <p className="text-sm opacity-90">登録済み商品の確認・編集</p>
            </button>
          </div>
        </section>

        {/* 最近の購入履歴 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">最近の購入</h2>
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">ドラッグストアでの買い物</h3>
                  <p className="text-sm text-gray-600">2024年1月15日</p>
                </div>
                <span className="text-sm text-gray-500">3商品</span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>アタック洗剤</span>
                  <span className="text-gray-600">¥298</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>キッコーマン醤油</span>
                  <span className="text-gray-600">¥158</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>歯磨き粉</span>
                  <span className="text-gray-600">¥248</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-around py-2">
            <button className="flex flex-col items-center py-2 px-3 text-blue-600">
              <Bell className="h-6 w-6" />
              <span className="text-xs mt-1">ホーム</span>
            </button>
            <button 
              onClick={() => setShowCamera(true)}
              className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-blue-600"
            >
              <Camera className="h-6 w-6" />
              <span className="text-xs mt-1">撮影</span>
            </button>
            <button className="flex flex-col items-center py-2 px-3 text-gray-400">
              <Package className="h-6 w-6" />
              <span className="text-xs mt-1">商品</span>
            </button>
            <button className="flex flex-col items-center py-2 px-3 text-gray-400">
              <Settings className="h-6 w-6" />
              <span className="text-xs mt-1">設定</span>
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
    </div>
  )
} 
