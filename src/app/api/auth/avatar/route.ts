import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const { avatarUrl } = await request.json();

    if (!avatarUrl) {
      return NextResponse.json(
        { error: 'URL аватара не указан' },
        { status: 400 }
      );
    }

    await query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2',
      [avatarUrl, decoded.userId]
    );

    return NextResponse.json(
      { message: 'Аватар обновлен', avatarUrl },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Avatar update error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении аватара' },
      { status: 500 }
    );
  }
}
