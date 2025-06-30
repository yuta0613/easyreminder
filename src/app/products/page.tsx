'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ProductData, DEFAULT_CATEGORIES, DEFAULT_CONSUMPTION_DAYS } from '@/lib/products'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    defaultConsumptionDays: 30,
    currentConsumptionDays: 30,
    barcode: ''
  })

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await fetchProducts()
        setShowAddForm(false)
        setEditingProduct(null)
        setFormData({
          name: '',
          category: '',
          defaultConsumptionDays: 30,
          currentConsumptionDays: 30,
          barcode: ''
        })
      }
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  const handleEdit = (product: ProductData) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      defaultConsumptionDays: product.defaultConsumptionDays,
      currentConsumptionDays: product.currentConsumptionDays,
      barcode: product.barcode || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この商品を削除しますか？')) return
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchProducts()
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const handleCategoryChange = (category: string) => {
    const defaultDays = DEFAULT_CONSUMPTION_DAYS[category as keyof typeof DEFAULT_CONSUMPTION_DAYS] || 30
    setFormData(prev => ({
      ...prev,
      category,
      defaultConsumptionDays: defaultDays,
      currentConsumptionDays: defaultDays
    }))
  }

  const getStatusColor = (status?: 'ok' | 'warning' | 'urgent') => {
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

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, ProductData[]>)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-gray-50)' }}>
      {/* ヘッダー */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gradient-primary">商品管理</h1>
                <p className="text-lg" style={{ color: 'var(--color-gray-600)' }}>
                  登録済み商品の確認・編集・削除
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              商品追加
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="text-center py-16 card-modern">
            <div className="animate-spin h-8 w-8 mx-auto mb-4 border-3 rounded-full" 
                 style={{ 
                   borderColor: 'var(--color-primary)',
                   borderTopColor: 'transparent'
                 }}></div>
            <p className="text-lg" style={{ color: 'var(--color-gray-500)' }}>
              商品を読み込み中...
            </p>
          </div>
        ) : Object.keys(groupedProducts).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <section key={category}>
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-gray-900)' }}>
                  {category}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryProducts.map(product => {
                    const statusStyle = getStatusColor(product.status)
                    return (
                      <div
                        key={product.id}
                        className="card-modern p-6"
                        style={{
                          backgroundColor: product.status ? statusStyle.backgroundColor : 'white',
                          borderColor: product.status ? statusStyle.borderColor : 'rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2" 
                                style={{ color: product.status ? statusStyle.textColor : 'var(--color-gray-900)' }}>
                              {product.name}
                            </h3>
                            <div className="space-y-1 text-sm" style={{ color: 'var(--color-gray-600)' }}>
                              <p>消費期間: {product.currentConsumptionDays}日</p>
                              {product.lastPurchaseDate && (
                                <p>
                                  最終購入: {new Date(product.lastPurchaseDate).toLocaleDateString()}
                                </p>
                              )}
                              {product.daysUntilEmpty !== undefined && (
                                <p>
                                  残り: {product.daysUntilEmpty > 0 ? `${product.daysUntilEmpty}日` : '期限切れ'}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Edit className="h-4 w-4" style={{ color: 'var(--color-gray-600)' }} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" style={{ color: 'var(--color-danger)' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 card-modern">
            <Package className="mx-auto h-16 w-16 mb-4" style={{ color: 'var(--color-gray-400)' }} />
            <p className="text-lg mb-4" style={{ color: 'var(--color-gray-500)' }}>
              登録された商品がありません
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
              }}
            >
              最初の商品を追加
            </button>
          </div>
        )}
      </main>

      {/* 商品追加・編集フォーム */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card-modern p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-gray-900)' }}>
              {editingProduct ? '商品編集' : '商品追加'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-gray-700)' }}>
                  商品名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-gray-700)' }}>
                  カテゴリ
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">選択してください</option>
                  {DEFAULT_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-gray-700)' }}>
                  消費期間（日）
                </label>
                <input
                  type="number"
                  value={formData.currentConsumptionDays}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    currentConsumptionDays: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  required
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {[7, 14, 30, 60, 90, 180].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, currentConsumptionDays: days }))}
                      className="px-3 py-1 text-xs rounded-full border hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--color-gray-600)' }}
                    >
                      {days}日
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--color-gray-500)' }}>
                  デフォルト: {formData.defaultConsumptionDays}日
                  {editingProduct && (
                    <span className="ml-2">
                      （購入履歴から自動調整されます）
                    </span>
                  )}
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingProduct(null)
                    setFormData({
                      name: '',
                      category: '',
                      defaultConsumptionDays: 30,
                      currentConsumptionDays: 30,
                      barcode: ''
                    })
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ color: 'var(--color-gray-700)' }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: 'var(--color-primary)',
                    color: 'white'
                  }}
                >
                  {editingProduct ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}