import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    
    const result = await query(
      `SELECT id, author_name, avatar_url, car_brand, car_model, rating, text, created_at 
       FROM testimonials 
       WHERE is_approved = true 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [parseInt(limit)]
    );

    return NextResponse.json({
      testimonials: result.rows,
    });
  } catch (error: unknown) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке отзывов' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { author_name, author_email, avatar_url, car_brand, car_model, rating, text } = await request.json();

    // Получаем user_id из токена если есть
    const token = request.cookies.get('token')?.value;
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: number };
        userId = decoded.userId;
      } catch {
        console.log('Token verification failed');
      }
    }

    if (!author_name || !rating || !text) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Рейтинг должен быть от 1 до 5' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO testimonials (user_id, author_name, author_email, avatar_url, car_brand, car_model, rating, text, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       RETURNING id, avatar_url`,
      [userId, author_name, author_email || null, avatar_url || null, car_brand || null, car_model || null, rating, text]
    );

    return NextResponse.json(
      { 
        message: 'Отзыв успешно добавлен',
        id: result.rows[0].id,
        avatar_url: result.rows[0].avatar_url
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании отзыва' },
      { status: 500 }
    );
  }
}
