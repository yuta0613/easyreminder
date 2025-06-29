import { NextResponse } from 'next/server'
import { getTodayReminders } from '@/lib/reminders'

export async function GET(request: Request) {
  try {
    // TODO: 実際の認証システムから取得
    const userId = 'demo-user-id'
    
    const reminders = await getTodayReminders(userId)
    
    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Failed to fetch reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}