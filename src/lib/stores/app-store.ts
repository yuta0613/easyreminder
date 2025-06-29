import { create } from 'zustand'
import { AppState, User, Product, Reminder, OCRResult } from '@/types'

export const useAppStore = create<AppState>((set, get) => ({
  // State
  user: null,
  products: [],
  reminders: [],
  ocrResult: null,

  // Actions
  setUser: (user: User) => set({ user }),

  addProduct: (product: Product) => 
    set((state) => ({ products: [...state.products, product] })),

  updateProduct: (id: string, updates: Partial<Product>) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id ? { ...product, ...updates } : product
      ),
    })),

  fetchProducts: async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      if (data.success) {
        set({ products: data.data })
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  },

  setOCRResult: (result: OCRResult) => set({ ocrResult: result }),
}))

// サンプルデータを追加する関数
export const initializeSampleData = () => {
  const sampleProducts: Product[] = [
    {
      id: '1',
      householdId: 'household-1',
      name: '衣料用洗剤',
      category: '洗剤',
      defaultConsumptionDays: 60,
      currentConsumptionDays: 60,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      householdId: 'household-1',
      name: '醤油',
      category: '調味料',
      defaultConsumptionDays: 180,
      currentConsumptionDays: 180,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '3',
      householdId: 'household-1',
      name: '歯磨き粉',
      category: 'トイレタリー',
      defaultConsumptionDays: 30,
      currentConsumptionDays: 30,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ]

  const sampleReminders: Reminder[] = [
    {
      id: '1',
      productId: '1',
      userId: 'user-1',
      reminderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2日後
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      productId: '2',
      userId: 'user-1',
      reminderDate: new Date(), // 今日
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      productId: '3',
      userId: 'user-1',
      reminderDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5日後
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  useAppStore.setState({ 
    products: sampleProducts,
    reminders: sampleReminders
  })
} 
