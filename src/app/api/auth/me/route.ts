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

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };

    const result = await query(
      'SELECT id, email, first_name, last_name, phone, avatar_url, is_admin, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: fullName,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        is_admin: user.is_admin || false,
        created_at: user.created_at,
      },
    });
  } catch (error: unknown) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Не авторизован' },
      { status: 401 }
    );
  }
}
