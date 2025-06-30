import { prisma } from './db'

export interface ProductData {
  id: string
  name: string
  category: string
  defaultConsumptionDays: number
  currentConsumptionDays: number
  barcode?: string
  lastPurchaseDate?: Date
  lastPurchasePrice?: number
  daysUntilEmpty?: number
  status?: 'ok' | 'warning' | 'urgent'
}

export async function getProducts(householdId: string): Promise<ProductData[]> {
  const products = await prisma.product.findMany({
    where: { householdId },
    include: {
      purchases: {
        orderBy: { purchasedAt: 'desc' },
        take: 1
      }
    },
    orderBy: { name: 'asc' }
  })

  return products.map(product => {
    const lastPurchase = product.purchases[0]
    let daysUntilEmpty: number | undefined
    let status: 'ok' | 'warning' | 'urgent' | undefined

    if (lastPurchase) {
      const daysSincePurchase = Math.floor(
        (new Date().getTime() - lastPurchase.purchasedAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      daysUntilEmpty = product.currentConsumptionDays - daysSincePurchase

      if (daysUntilEmpty <= 0) {
        status = 'urgent'
      } else if (daysUntilEmpty <= 3) {
        status = 'warning'
      } else {
        status = 'ok'
      }
    }

    return {
      id: product.id,
      name: product.name,
      category: product.category,
      defaultConsumptionDays: product.defaultConsumptionDays,
      currentConsumptionDays: product.currentConsumptionDays,
      barcode: product.barcode || undefined,
      lastPurchaseDate: lastPurchase?.purchasedAt,
      lastPurchasePrice: lastPurchase?.price || undefined,
      daysUntilEmpty,
      status
    }
  })
}

export async function createProduct(data: {
  householdId: string
  name: string
  category: string
  defaultConsumptionDays: number
  currentConsumptionDays?: number
  barcode?: string
}): Promise<ProductData> {
  const product = await prisma.product.create({
    data: {
      householdId: data.householdId,
      name: data.name,
      category: data.category,
      defaultConsumptionDays: data.defaultConsumptionDays,
      currentConsumptionDays: data.currentConsumptionDays || data.defaultConsumptionDays,
      barcode: data.barcode
    }
  })

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    defaultConsumptionDays: product.defaultConsumptionDays,
    currentConsumptionDays: product.currentConsumptionDays,
    barcode: product.barcode || undefined
  }
}

export async function updateProduct(id: string, data: {
  name?: string
  category?: string
  defaultConsumptionDays?: number
  currentConsumptionDays?: number
  barcode?: string
}): Promise<ProductData> {
  const product = await prisma.product.update({
    where: { id },
    data
  })

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    defaultConsumptionDays: product.defaultConsumptionDays,
    currentConsumptionDays: product.currentConsumptionDays,
    barcode: product.barcode || undefined
  }
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({
    where: { id }
  })
}

export async function getProductCategories(): Promise<string[]> {
  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category']
  })

  return categories.map(c => c.category)
}

export const DEFAULT_CATEGORIES = [
  '洗剤類',
  '調味料', 
  'ケア用品',
  'トイレタリー',
  'その他日用品'
]

export const DEFAULT_CONSUMPTION_DAYS = {
  '洗剤類': 60,
  '調味料': 180,
  'ケア用品': 90,
  'トイレタリー': 90,
  'その他日用品': 30
}

/**
 * 購入履歴から消費ペースを学習して更新
 */
export async function updateConsumptionPace(productId: string): Promise<void> {
  // 過去の購入履歴を取得（最新3件）
  const purchases = await prisma.purchaseHistory.findMany({
    where: { productId },
    orderBy: { purchasedAt: 'desc' },
    take: 3
  })

  if (purchases.length < 2) {
    // 購入履歴が2件未満の場合は学習できない
    return
  }

  // 購入間隔を計算
  const intervals: number[] = []
  for (let i = 0; i < purchases.length - 1; i++) {
    const current = purchases[i].purchasedAt
    const previous = purchases[i + 1].purchasedAt
    const daysDiff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
    intervals.push(daysDiff)
  }

  // 平均購入間隔を計算
  const avgInterval = Math.floor(intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length)
  
  if (avgInterval > 0) {
    // 現在の消費ペースを学習結果で更新
    // 既存の値と学習結果の加重平均を取る（学習結果の重みを0.7とする）
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    
    if (product) {
      const newConsumptionDays = Math.floor(product.currentConsumptionDays * 0.3 + avgInterval * 0.7)
      
      await prisma.product.update({
        where: { id: productId },
        data: { currentConsumptionDays: newConsumptionDays }
      })
    }
  }
}