import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const { id } = await context.params;

    // Проверяем, что запись принадлежит пользователю
    const checkResult = await query(
      'SELECT user_id FROM bookings WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Запись не найдена' },
        { status: 404 }
      );
    }

    if (checkResult.rows[0].user_id !== decoded.userId) {
      return NextResponse.json(
        { error: 'Нет доступа к этой записи' },
        { status: 403 }
      );
    }

    // Удаляем запись
    await query('DELETE FROM bookings WHERE id = $1', [id]);

    return NextResponse.json(
      { message: 'Запись удалена' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении записи' },
      { status: 500 }
    );
  }
}
