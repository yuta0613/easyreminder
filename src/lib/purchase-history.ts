import { prisma } from './db'
import { createProduct, getProducts, updateConsumptionPace } from './products'
import { createReminder } from './reminders'
import { DEFAULT_CONSUMPTION_DAYS } from './products'

export interface PurchaseData {
  productName: string
  price: number
  category: string
  confidence: number
  quantity?: number
}

// ExtractedProductをPurchaseDataに変換する関数
function convertExtractedToPurchaseData(extracted: any[]): PurchaseData[] {
  return extracted.map(item => ({
    productName: item.name || item.productName,
    price: item.price,
    category: item.category,
    confidence: item.confidence,
    quantity: item.quantity || 1
  }))
}

export interface SavePurchaseResult {
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

export async function savePurchaseFromOCR(
  purchases: PurchaseData[],
  userId: string,
  householdId: string,
  purchaseDate: Date = new Date()
): Promise<SavePurchaseResult> {
  const result: SavePurchaseResult = {
    savedProducts: 0,
    createdProducts: 0,
    updatedProducts: 0,
    createdReminders: 0,
    products: []
  }

  // 既存商品を取得
  const existingProducts = await getProducts(householdId)
  const existingProductMap = new Map(
    existingProducts.map(p => [p.name.toLowerCase(), p])
  )

  // 商品名の類似度を計算（簡易版）
  function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().replace(/\s+/g, '')
    const s2 = str2.toLowerCase().replace(/\s+/g, '')
    
    if (s1 === s2) return 1.0
    
    // 部分一致をチェック
    if (s1.includes(s2) || s2.includes(s1)) {
      return Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length)
    }
    
    // 文字の共通部分を計算
    const longer = s1.length > s2.length ? s1 : s2
    const shorter = s1.length > s2.length ? s2 : s1
    
    let matches = 0
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) {
        matches++
      }
    }
    
    return matches / longer.length
  }

  // 類似商品を見つける
  function findSimilarProduct(productName: string): typeof existingProducts[0] | undefined {
    let bestMatch: typeof existingProducts[0] | undefined = undefined
    let bestScore = 0
    
    for (const product of existingProducts) {
      const score = calculateSimilarity(productName, product.name)
      if (score > 0.8 && score > bestScore) { // 80%以上の類似度
        bestMatch = product
        bestScore = score
      }
    }
    
    return bestMatch
  }

  for (const purchase of purchases) {
    let product = existingProductMap.get(purchase.productName.toLowerCase())
    let isNew = false

    // 完全一致しない場合は類似商品を検索
    if (!product) {
      product = findSimilarProduct(purchase.productName)
    }

    // 商品が存在しない場合は新規作成
    if (!product) {
      const defaultDays = DEFAULT_CONSUMPTION_DAYS[purchase.category as keyof typeof DEFAULT_CONSUMPTION_DAYS] || 30
      
      const newProduct = await createProduct({
        householdId,
        name: purchase.productName,
        category: purchase.category,
        defaultConsumptionDays: defaultDays,
        currentConsumptionDays: defaultDays
      })
      
      product = newProduct
      isNew = true
      result.createdProducts++
    }

    // 購入履歴を保存
    await prisma.purchaseHistory.create({
      data: {
        productId: product.id,
        userId,
        price: purchase.price,
        quantity: purchase.quantity || 1,
        purchasedAt: purchaseDate
      }
    })

    // 消費ペースを学習して更新（既存商品の場合）
    if (!isNew) {
      try {
        await updateConsumptionPace(product.id)
        // 学習後の最新データを取得
        const updatedProduct = await prisma.product.findUnique({
          where: { id: product.id }
        })
        if (updatedProduct) {
          product = {
            ...product,
            currentConsumptionDays: updatedProduct.currentConsumptionDays
          }
        }
      } catch (error) {
        console.log(`Failed to update consumption pace for product ${product.id}:`, error)
      }
    }

    // リマインダーを作成（次回購入予定日）
    const reminderDate = new Date(purchaseDate)
    reminderDate.setDate(reminderDate.getDate() + product.currentConsumptionDays - 3) // 3日前にリマインド

    try {
      await createReminder(product.id, userId, reminderDate)
      result.createdReminders++
    } catch (error) {
      // 既にリマインダーが存在する場合はスキップ
      console.log(`Reminder already exists for product ${product.id}`)
    }

    result.products.push({
      id: product.id,
      name: product.name,
      category: product.category,
      isNew,
      reminderDate
    })

    result.savedProducts++
  }

  return result
}

export async function getPurchaseHistory(userId: string, limit: number = 10) {
  const purchases = await prisma.purchaseHistory.findMany({
    where: { userId },
    include: {
      product: true
    },
    orderBy: {
      purchasedAt: 'desc'
    },
    take: limit
  })

  // 購入日でグループ化
  const groupedPurchases = purchases.reduce((acc, purchase) => {
    const dateKey = purchase.purchasedAt.toISOString().split('T')[0]
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: purchase.purchasedAt,
        items: [],
        totalPrice: 0,
        totalItems: 0
      }
    }
    
    acc[dateKey].items.push({
      name: purchase.product.name,
      price: purchase.price || 0,
      quantity: purchase.quantity,
      category: purchase.product.category
    })
    
    acc[dateKey].totalPrice += (purchase.price || 0) * purchase.quantity
    acc[dateKey].totalItems += purchase.quantity
    
    return acc
  }, {} as Record<string, {
    date: Date
    items: Array<{
      name: string
      price: number
      quantity: number
      category: string
    }>
    totalPrice: number
    totalItems: number
  }>)

  return Object.values(groupedPurchases).slice(0, 5) // 最新5件の購入グループ
}