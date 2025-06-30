'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag } from 'lucide-react'

interface PurchaseItem {
  name: string
  price: number
  quantity: number
  category: string
}

interface PurchaseGroup {
  date: Date
  items: PurchaseItem[]
  totalPrice: number
  totalItems: number
}

export function PurchaseHistorySection() {
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPurchaseHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/purchase-history?limit=3')
      if (response.ok) {
        const data = await response.json()
        setPurchaseHistory(data)
      }
    } catch (error) {
      console.error('Failed to fetch purchase history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPurchaseHistory()
  }, [])

  if (isLoading) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-gray-900)' }}>
          最近の購入
        </h2>
        <div className="text-center py-16 card-modern">
          <div className="animate-spin h-8 w-8 mx-auto mb-4 border-3 rounded-full" 
               style={{ 
                 borderColor: 'var(--color-primary)',
                 borderTopColor: 'transparent'
               }}></div>
          <p className="text-lg" style={{ color: 'var(--color-gray-500)' }}>
            購入履歴を読み込み中...
          </p>
        </div>
      </section>
    )
  }

  if (purchaseHistory.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-gray-900)' }}>
          最近の購入
        </h2>
        <div className="text-center py-16 card-modern">
          <ShoppingBag className="mx-auto h-16 w-16 mb-4" style={{ color: 'var(--color-gray-400)' }} />
          <p className="text-lg" style={{ color: 'var(--color-gray-500)' }}>
            購入履歴がありません
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-gray-400)' }}>
            レシートを撮影して商品を登録してみましょう
          </p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-gray-900)' }}>
        最近の購入
      </h2>
      
      <div className="space-y-6">
        {purchaseHistory.map((group, index) => (
          <div key={index} className="card-modern overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--color-gray-900)' }}>
                    買い物
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-gray-600)' }}>
                    {new Date(group.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold mb-1" style={{ color: 'var(--color-gray-900)' }}>
                    ¥{group.totalPrice.toLocaleString()}
                  </div>
                  <span className="text-sm font-medium px-3 py-1 rounded-full"
                        style={{ 
                          backgroundColor: 'var(--color-gray-100)',
                          color: 'var(--color-gray-700)'
                        }}>
                    {group.totalItems}商品
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {group.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between items-center py-2">
                    <div>
                      <span className="font-medium" style={{ color: 'var(--color-gray-900)' }}>
                        {item.name}
                      </span>
                      {item.quantity > 1 && (
                        <span className="ml-2 text-sm" style={{ color: 'var(--color-gray-500)' }}>
                          × {item.quantity}
                        </span>
                      )}
                      <div className="text-xs mt-1" style={{ color: 'var(--color-gray-500)' }}>
                        {item.category}
                      </div>
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--color-gray-700)' }}>
                      ¥{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}