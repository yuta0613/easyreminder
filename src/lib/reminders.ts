import { prisma } from './db'

export interface ReminderData {
  id: string
  productName: string
  daysLeft: number
  status: 'ok' | 'warning' | 'urgent'
  reminderDate: Date
  productId: string
}

export async function getTodayReminders(userId: string): Promise<ReminderData[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(today.getDate() - 3)
  
  const threeDaysFromNow = new Date(today)
  threeDaysFromNow.setDate(today.getDate() + 3)

  // 期限後、当日、3日前のリマインダーを取得
  const reminders = await prisma.reminder.findMany({
    where: {
      userId,
      status: 'pending',
      reminderDate: {
        gte: threeDaysAgo,  // 3日前から
        lte: threeDaysFromNow  // 3日後まで
      }
    },
    include: {
      product: true
    },
    orderBy: {
      reminderDate: 'asc'
    }
  })

  return reminders.map(reminder => {
    const reminderDateOnly = new Date(reminder.reminderDate)
    reminderDateOnly.setHours(0, 0, 0, 0)
    
    const daysLeft = Math.ceil((reminderDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    let status: 'ok' | 'warning' | 'urgent'
    if (daysLeft < 0) {
      status = 'urgent'  // 期限後
    } else if (daysLeft === 0) {
      status = 'urgent'  // 当日
    } else if (daysLeft <= 3) {
      status = 'warning'  // 3日前
    } else {
      status = 'ok'
    }

    return {
      id: reminder.id,
      productName: reminder.product.name,
      daysLeft: Math.abs(daysLeft),
      status,
      reminderDate: reminder.reminderDate,
      productId: reminder.productId
    }
  })
}

export async function completeReminder(reminderId: string): Promise<void> {
  await prisma.reminder.update({
    where: { id: reminderId },
    data: { status: 'completed' }
  })
}

export async function createReminder(productId: string, userId: string, reminderDate: Date): Promise<void> {
  await prisma.reminder.create({
    data: {
      productId,
      userId,
      reminderDate,
      status: 'pending'
    }
  })
}