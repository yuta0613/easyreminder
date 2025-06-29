import { NextResponse } from 'next/server'
import { updateProduct, deleteProduct } from '@/lib/products'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const product = await updateProduct(params.id, {
      name: body.name,
      category: body.category,
      defaultConsumptionDays: body.defaultConsumptionDays,
      currentConsumptionDays: body.currentConsumptionDays,
      barcode: body.barcode
    })
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to update product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteProduct(params.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}