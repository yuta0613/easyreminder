import { NextResponse } from 'next/server'
import { getProducts, createProduct } from '@/lib/products'

export async function GET(request: Request) {
  try {
    // TODO: 実際の認証システムから取得
    const householdId = 'demo-household-id'
    
    const products = await getProducts(householdId)
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // TODO: 実際の認証システムから取得
    const householdId = 'demo-household-id'
    
    const product = await createProduct({
      householdId,
      name: body.name,
      category: body.category,
      defaultConsumptionDays: body.defaultConsumptionDays,
      currentConsumptionDays: body.currentConsumptionDays,
      barcode: body.barcode
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}