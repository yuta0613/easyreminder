import { NextResponse } from 'next/server'
import { completeReminder } from '@/lib/reminders'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await completeReminder(params.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to complete reminder:', error)
    return NextResponse.json(
      { error: 'Failed to complete reminder' },
      { status: 500 }
    )
  }
}