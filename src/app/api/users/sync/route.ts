import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const { clerkId, email, firstName, lastName, phone } = await request.json();

    if (!clerkId || !email) {
      return NextResponse.json(
        { error: 'Недостаточно данных' },
        { status: 400 }
      );
    }

    // Проверяем существует ли пользователь
    const existingUser = await query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [clerkId]
    );

    if (existingUser.rows.length > 0) {
      // Обновляем существующего пользователя
      await query(
        `UPDATE users 
         SET email = $2, first_name = $3, last_name = $4, phone = $5, updated_at = CURRENT_TIMESTAMP
         WHERE clerk_id = $1`,
        [clerkId, email, firstName || '', lastName || '', phone || null]
      );

      return NextResponse.json(
        { message: 'Пользователь обновлен', userId: existingUser.rows[0].id },
        { status: 200 }
      );
    } else {
      // Создаем нового пользователя
      const result = await query(
        `INSERT INTO users (clerk_id, email, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [clerkId, email, firstName || '', lastName || '', phone || null]
      );

      return NextResponse.json(
        { message: 'Пользователь создан', userId: result.rows[0].id },
        { status: 201 }
      );
    }
  } catch (error: unknown) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Ошибка синхронизации пользователя' },
      { status: 500 }
    );
  }
}
