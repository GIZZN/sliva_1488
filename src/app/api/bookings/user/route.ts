import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // Получаем все записи пользователя
    const result = await query(
      `SELECT 
        id, 
        service_name, 
        service_price as total_price,
        booking_date, 
        booking_time, 
        car_model, 
        car_number, 
        status, 
        notes,
        created_at
      FROM bookings 
      WHERE user_id = $1 
      ORDER BY created_at DESC`,
      [decoded.userId]
    );

    return NextResponse.json({
      bookings: result.rows,
    });
  } catch (error: unknown) {
    console.error('Get user bookings error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении записей' },
      { status: 500 }
    );
  }
}
