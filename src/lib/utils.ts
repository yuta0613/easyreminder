import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 日付関連のユーティリティ
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric'
  }).format(date)
}

// リマインダー関連のユーティリティ
export function calculateNextReminder(
  lastPurchaseDate: Date,
  consumptionDays: number,
  warningDays: number = 3
): Date {
  const nextEmptyDate = new Date(lastPurchaseDate)
  nextEmptyDate.setDate(nextEmptyDate.getDate() + consumptionDays)
  
  const reminderDate = new Date(nextEmptyDate)
  reminderDate.setDate(reminderDate.getDate() - warningDays)
  
  return reminderDate
}

export function getDaysUntilEmpty(
  lastPurchaseDate: Date,
  consumptionDays: number
): number {
  const nextEmptyDate = new Date(lastPurchaseDate)
  nextEmptyDate.setDate(nextEmptyDate.getDate() + consumptionDays)
  
  const today = new Date()
  const diffTime = nextEmptyDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

export function getStatusFromDaysLeft(daysLeft: number): 'ok' | 'warning' | 'urgent' {
  if (daysLeft <= 0) return 'urgent'
  if (daysLeft <= 3) return 'warning'
  return 'ok'
}

// 商品カテゴリ関連
export const PRODUCT_CATEGORIES = [
  '洗剤',
  '調味料', 
  'ケア用品',
  'トイレタリー',
  'その他日用品'
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]

// デフォルトの消費期間（日数）
export const DEFAULT_CONSUMPTION_DAYS: Record<ProductCategory, number> = {
  '洗剤': 60,
  '調味料': 180,
  'ケア用品': 90,
  'トイレタリー': 30,
  'その他日用品': 60
} 
