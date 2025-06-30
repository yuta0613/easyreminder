import { NextResponse } from 'next/server'
import { getPurchaseHistory } from '@/lib/purchase-history'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // TODO: 実際の認証システムから取得
    const userId = 'demo-user-id'
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const purchaseHistory = await getPurchaseHistory(userId, limit)
    
    return NextResponse.json(purchaseHistory)
  } catch (error) {
    console.error('Failed to fetch purchase history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase history' },
      { status: 500 }
    )
  }
}