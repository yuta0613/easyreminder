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
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(today.getDate() + 3)

  const reminders = await prisma.reminder.findMany({
    where: {
      userId,
      status: 'pending',
      reminderDate: {
        lte: threeDaysFromNow
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
    const daysLeft = Math.ceil((reminder.reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    let status: 'ok' | 'warning' | 'urgent'
    if (daysLeft <= 0) {
      status = 'urgent'
    } else if (daysLeft <= 2) {
      status = 'warning'
    } else {
      status = 'ok'
    }

    return {
      id: reminder.id,
      productName: reminder.product.name,
      daysLeft: Math.max(0, daysLeft),
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