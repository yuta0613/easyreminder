import { NextResponse } from 'next/server'
import { ocrService } from '@/lib/ocr'
import { savePurchaseFromOCR } from '@/lib/purchase-history'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { imageData } = body

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // OCR処理を実行
    const ocrResult = await ocrService.processReceipt(imageData)

    // TODO: 実際の認証システムから取得
    const userId = 'demo-user-id'
    const householdId = 'demo-household-id'

    // OCR結果から商品データを保存
    // ExtractedProductをPurchaseDataに変換
    const purchaseData = ocrResult.extractedProducts.map(item => ({
      productName: item.name,
      price: item.price,
      category: item.category,
      confidence: item.confidence,
      quantity: 1
    }))

    const saveResult = await savePurchaseFromOCR(
      purchaseData,
      userId,
      householdId
    )

    return NextResponse.json({
      ocrResult,
      saveResult,
      message: `${saveResult.savedProducts}個の商品を保存しました`
    })
  } catch (error) {
    console.error('OCR processing failed:', error)
    return NextResponse.json(
      { error: 'OCR処理に失敗しました' },
      { status: 500 }
    )
  }
}