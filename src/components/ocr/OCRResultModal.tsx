'use client'

import { useState } from 'react'
import { X, Check, Edit2, ShoppingCart } from 'lucide-react'

interface ExtractedProduct {
  name: string
  price: number
  category: string
  confidence: number
}

interface OCRResult {
  id: string
  extractedProducts: ExtractedProduct[]
  totalItems: number
  processingTime: number
}

interface SaveResult {
  savedProducts: number
  createdProducts: number
  updatedProducts: number
  createdReminders: number
  products: Array<{
    id: string
    name: string
    category: string
    isNew: boolean
    reminderDate: Date
  }>
}

interface OCRResultModalProps {
  ocrResult: OCRResult
  saveResult: SaveResult
  onClose: () => void
  onSave?: () => void
}

export function OCRResultModal({ ocrResult, saveResult, onClose, onSave }: OCRResultModalProps) {
  const [editedProducts, setEditedProducts] = useState(ocrResult.extractedProducts)
  const [isEditing, setIsEditing] = useState(false)

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'var(--color-secondary)'
    if (confidence >= 0.6) return 'var(--color-warning)'
    return 'var(--color-danger)'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return '高'
    if (confidence >= 0.6) return '中'
    return '低'
  }

  const handleProductEdit = (index: number, field: keyof ExtractedProduct, value: string | number) => {
    const updated = [...editedProducts]
    updated[index] = { ...updated[index], [field]: value }
    setEditedProducts(updated)
  }

  const handleSave = () => {
    onSave?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card-modern w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-gray-900)' }}>
              OCR処理結果
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-gray-600)' }}>
              {saveResult.savedProducts}個の商品を保存しました
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" style={{ color: 'var(--color-gray-600)' }} />
          </button>
        </div>

        {/* 保存結果サマリー */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-gray-50)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {saveResult.savedProducts}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-gray-600)' }}>
                保存された商品
              </div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-gray-50)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-secondary)' }}>
                {saveResult.createdProducts}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-gray-600)' }}>
                新規商品
              </div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-gray-50)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
                {saveResult.updatedProducts}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-gray-600)' }}>
                更新された商品
              </div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-gray-50)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {saveResult.createdReminders}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-gray-600)' }}>
                作成されたリマインダー
              </div>
            </div>
          </div>
        </div>

        {/* 商品リスト */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-gray-900)' }}>
              検出された商品
            </h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-3 py-1 rounded-lg transition-colors"
              style={{ 
                backgroundColor: isEditing ? 'var(--color-gray-200)' : 'var(--color-gray-100)',
                color: 'var(--color-gray-700)'
              }}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              {isEditing ? '編集完了' : '編集'}
            </button>
          </div>

          <div className="space-y-3">
            {editedProducts.map((product, index) => {
              const savedProduct = saveResult.products.find(p => 
                p.name.toLowerCase() === product.name.toLowerCase()
              )
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: savedProduct?.isNew ? 'rgba(52, 199, 89, 0.05)' : 'white',
                    borderColor: savedProduct?.isNew ? 'rgba(52, 199, 89, 0.2)' : 'var(--color-gray-200)'
                  }}
                >
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => handleProductEdit(index, 'name', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={product.price}
                            onChange={(e) => handleProductEdit(index, 'price', parseInt(e.target.value))}
                            className="w-20 px-2 py-1 border rounded text-sm"
                          />
                          <select
                            value={product.category}
                            onChange={(e) => handleProductEdit(index, 'category', e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="洗剤類">洗剤類</option>
                            <option value="調味料">調味料</option>
                            <option value="ケア用品">ケア用品</option>
                            <option value="トイレタリー">トイレタリー</option>
                            <option value="その他日用品">その他日用品</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium" style={{ color: 'var(--color-gray-900)' }}>
                            {product.name}
                          </h4>
                          {savedProduct?.isNew && (
                            <span 
                              className="px-2 py-1 text-xs rounded-full"
                              style={{ 
                                backgroundColor: 'var(--color-secondary)',
                                color: 'white'
                              }}
                            >
                              新規
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm" style={{ color: 'var(--color-gray-600)' }}>
                          <span>¥{product.price}</span>
                          <span>{product.category}</span>
                          <span 
                            className="flex items-center"
                            style={{ color: getConfidenceColor(product.confidence) }}
                          >
                            信頼度: {getConfidenceText(product.confidence)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <Check 
                      className="h-6 w-6" 
                      style={{ color: 'var(--color-secondary)' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm" style={{ color: 'var(--color-gray-600)' }}>
            処理時間: {ocrResult.processingTime}秒
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              style={{ color: 'var(--color-gray-700)' }}
            >
              閉じる
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              商品管理へ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}