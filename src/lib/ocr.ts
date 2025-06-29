import { OCRResult, ExtractedProduct } from '@/types'
import { PRODUCT_CATEGORIES, DEFAULT_CONSUMPTION_DAYS } from './utils'

// 日用品のキーワードパターン
const PRODUCT_KEYWORDS = {
  '洗剤': ['洗剤', 'せんざい', '洗濯', 'アタック', 'アリエール', 'ナノック', 'トップ'],
  '調味料': ['醤油', 'しょうゆ', '味噌', 'みそ', '砂糖', '塩', '油', 'サラダ油', '胡椒', 'こしょう', '酢', 'みりん'],
  'ケア用品': ['綿棒', 'コットン', '化粧水', 'クリーム', 'ローション', '美容液'],
  'トイレタリー': ['歯磨き', 'ハミガキ', 'シャンプー', '石鹸', 'せっけん', 'ボディソープ', 'リンス'],
  'その他日用品': ['ティッシュ', 'トイレットペーパー', '電池', '乾電池', '掃除用品']
}

export class OCRService {
  // 簡易OCR処理（実際のプロダクションではGoogle Cloud Vision APIなどを使用）
  async processReceipt(imageData: string): Promise<OCRResult> {
    try {
      // 開発用のモック処理
      // 実際の実装では画像をOCR APIに送信する
      await new Promise(resolve => setTimeout(resolve, 2000)) // 処理時間をシミュレート

      // モックデータ - 実際のOCR結果をシミュレート
      const mockOCRText = `
        ドラッグストア領収書
        2024/01/15 15:30
        ------------------
        アタック洗剤          ¥298
        キッコーマン醤油      ¥158  
        歯磨き粉             ¥248
        ティッシュペーパー    ¥128
        ------------------
        合計                ¥832
      `

      const extractedProducts = this.extractProducts(mockOCRText)
      
      return {
        id: Date.now().toString(),
        extractedProducts,
        totalItems: extractedProducts.length,
        processingTime: 2.1
      }
    } catch (error) {
      console.error('OCR processing failed:', error)
      throw new Error('OCR処理に失敗しました')
    }
  }

  // テキストから商品を抽出する
  private extractProducts(text: string): ExtractedProduct[] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line)
    const products: ExtractedProduct[] = []

    for (const line of lines) {
      // 価格パターンを含む行を探す
      const priceMatch = line.match(/¥(\d+)/)
      if (!priceMatch) continue

      const price = parseInt(priceMatch[1])
      const productName = line.replace(/¥\d+.*$/, '').trim()
      
      if (productName.length < 2) continue

      // カテゴリを判定
      const category = this.categorizeProduct(productName)
      if (category) {
        // 信頼度を計算（キーワードマッチの精度に基づく）
        const confidence = this.calculateConfidence(productName, category)
        
        products.push({
          name: productName,
          price,
          category,
          confidence
        })
      }
    }

    return products
  }

  // 商品名からカテゴリを判定
  private categorizeProduct(productName: string): string | null {
    const lowerName = productName.toLowerCase()
    
    for (const [category, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerName.includes(keyword.toLowerCase())) {
          return category
        }
      }
    }
    
    return null
  }

  // 信頼度を計算
  private calculateConfidence(productName: string, category: string): number {
    const keywords = PRODUCT_KEYWORDS[category as keyof typeof PRODUCT_KEYWORDS] || []
    const lowerName = productName.toLowerCase()
    
    let matchCount = 0
    for (const keyword of keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        matchCount++
      }
    }
    
    // マッチしたキーワード数に基づいて信頼度を計算（0.5〜1.0の範囲）
    return Math.min(0.5 + (matchCount * 0.1), 1.0)
  }

  // Google Cloud Vision APIを使用したOCR処理（実装例）
  async processWithGoogleVision(imageData: string): Promise<string> {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
    if (!apiKey) {
      throw new Error('Google Cloud Vision API key is not configured')
    }

    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
    
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Google Vision API request failed')
    }

    const result = await response.json()
    const textAnnotations = result.responses[0]?.textAnnotations
    
    if (!textAnnotations || textAnnotations.length === 0) {
      throw new Error('テキストが検出されませんでした')
    }

    return textAnnotations[0].description
  }
}

export const ocrService = new OCRService() 
