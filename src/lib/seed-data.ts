import { prisma } from './db'

export async function seedDemoData() {
  try {
    // デモユーザーの作成
    const user = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        id: 'demo-user-id',
        email: 'demo@example.com',
        name: 'デモユーザー',
      }
    })

    // デモ世帯の作成
    const household = await prisma.household.upsert({
      where: { id: 'demo-household-id' },
      update: {},
      create: {
        id: 'demo-household-id',
        name: 'デモ世帯',
        memberCount: 2,
      }
    })

    // ユーザーと世帯を関連付け
    await prisma.user.update({
      where: { id: user.id },
      data: { householdId: household.id }
    })

    // デモ商品の作成
    const products = [
      { name: '衣料用洗剤', category: '洗剤類', days: 60 },
      { name: '醤油', category: '調味料', days: 180 },
      { name: '歯磨き粉', category: 'トイレタリー', days: 90 },
    ]

    for (const productData of products) {
      const product = await prisma.product.upsert({
        where: { 
          householdId_name: { 
            householdId: household.id, 
            name: productData.name 
          } 
        },
        update: {},
        create: {
          householdId: household.id,
          name: productData.name,
          category: productData.category,
          defaultConsumptionDays: productData.days,
          currentConsumptionDays: productData.days,
        }
      })

      // 購入履歴の作成（過去の購入）
      const purchaseDate = new Date()
      purchaseDate.setDate(purchaseDate.getDate() - Math.floor(productData.days * 0.8))

      await prisma.purchaseHistory.upsert({
        where: { 
          productId_userId_purchasedAt: {
            productId: product.id,
            userId: user.id,
            purchasedAt: purchaseDate
          }
        },
        update: {},
        create: {
          productId: product.id,
          userId: user.id,
          price: productData.name === '衣料用洗剤' ? 298 : 
                 productData.name === '醤油' ? 158 : 248,
          quantity: 1,
          purchasedAt: purchaseDate,
        }
      })

      // リマインダーの作成
      const reminderDate = new Date()
      const daysToAdd = productData.name === '衣料用洗剤' ? 2 : 
                       productData.name === '醤油' ? 0 : 5
      reminderDate.setDate(reminderDate.getDate() + daysToAdd)

      await prisma.reminder.upsert({
        where: {
          productId_userId_reminderDate: {
            productId: product.id,
            userId: user.id,
            reminderDate: reminderDate
          }
        },
        update: {},
        create: {
          productId: product.id,
          userId: user.id,
          reminderDate: reminderDate,
          status: 'pending',
        }
      })
    }

    console.log('Demo data seeded successfully')
  } catch (error) {
    console.error('Error seeding demo data:', error)
    throw error
  }
}