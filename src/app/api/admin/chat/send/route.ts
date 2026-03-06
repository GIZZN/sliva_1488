import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, userId } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Сохраняем сообщение от поддержки
    await query(
      `INSERT INTO support_messages (user_id, message_text, sender, status)
       VALUES ($1, $2, 'support', 'sent')`,
      [userId, text]
    );

    // Отправляем через SSE
    try {
      const { broadcastMessage } = await import('@/lib/sse-broadcast');
      broadcastMessage({
        type: 'message',
        text,
        timestamp: new Date().toISOString()
      }, userId); // Передаем userId для отправки конкретному пользователю
    } catch (error) {
      console.log('SSE broadcast not available:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
