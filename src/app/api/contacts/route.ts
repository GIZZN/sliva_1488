import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await query(
      `INSERT INTO contact_messages (name, email, phone, message, status)
       VALUES ($1, $2, $3, $4, 'new')`,
      [name, email, phone || null, message]
    );

    return NextResponse.json({ 
      success: true,
      message: 'Message sent successfully' 
    });
  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
