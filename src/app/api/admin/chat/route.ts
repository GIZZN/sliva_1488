import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем список пользователей с последними сообщениями
    const usersResult = await query(
      `SELECT DISTINCT ON (sm.user_id)
        sm.user_id,
        u.email as user_email,
        u.first_name as user_name,
        sm.message_text as last_message,
        sm.created_at as last_message_time,
        (SELECT COUNT(*) FROM support_messages 
         WHERE user_id = sm.user_id AND sender = 'user' AND status != 'read') as unread_count
      FROM support_messages sm
      LEFT JOIN users u ON sm.user_id = u.id
      WHERE sm.sender = 'user'
      ORDER BY sm.user_id, sm.created_at DESC`
    );

    const unreadCount = await query(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM support_messages
       WHERE sender = 'user' AND status != 'read'`
    );

    return NextResponse.json({ 
      users: usersResult.rows,
      unreadCount: parseInt(unreadCount.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
