import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT id, name, description, price, duration, is_active
       FROM services
       WHERE is_active = true
       ORDER BY price ASC`
    );

    return NextResponse.json({ services: result.rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
