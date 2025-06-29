// User types
export interface User {
  id: string
  email: string
  name: string
  householdId?: string
  createdAt: Date
  updatedAt: Date
}

// Household types
export interface Household {
  id: string
  name: string
  memberCount: number
  createdAt: Date
  updatedAt: Date
}

// Product types
export interface Product {
  id: string
  householdId: string
  name: string
  category: string
  defaultConsumptionDays: number
  currentConsumptionDays: number
  barcode?: string
  createdAt: Date
  updatedAt: Date
}

// Purchase History types
export interface PurchaseHistory {
  id: string
  productId: string
  userId: string
  price?: number
  quantity: number
  purchasedAt: Date
  receiptImageUrl?: string
  createdAt: Date
}

// Reminder types
export interface Reminder {
  id: string
  productId: string
  userId: string
  reminderDate: Date
  status: 'pending' | 'completed' | 'dismissed'
  createdAt: Date
  updatedAt: Date
}

// OCR Result types
export interface OCRResult {
  id: string
  extractedProducts: ExtractedProduct[]
  totalItems: number
  processingTime: number
}

export interface ExtractedProduct {
  name: string
  price: number
  category: string
  confidence: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

// App State types
export interface AppState {
  user: User | null
  products: Product[]
  reminders: Reminder[]
  ocrResult: OCRResult | null
  
  // Actions
  setUser: (user: User) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  fetchProducts: () => Promise<void>
  setOCRResult: (result: OCRResult) => void
} 
