import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/adminAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = await params;

    const result = await query(
      `SELECT sm.id, sm.user_id, sm.message_text, sm.sender, sm.created_at,
              u.email as user_email, u.first_name as user_name
       FROM support_messages sm
       LEFT JOIN users u ON sm.user_id = u.id
       WHERE sm.user_id = $1
       ORDER BY sm.created_at ASC`,
      [userId]
    );

    // Отмечаем сообщения как прочитанные
    await query(
      `UPDATE support_messages 
       SET status = 'read' 
       WHERE user_id = $1 AND sender = 'user' AND status != 'read'`,
      [userId]
    );

    return NextResponse.json({ messages: result.rows });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = await params;

    // Удаляем все сообщения пользователя
    await query(
      `DELETE FROM support_messages WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
