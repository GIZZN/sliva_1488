import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT 
        id, service_id, service_name, service_price,
        booking_date, booking_time, car_model, car_number,
        status, notes, created_at
      FROM bookings 
      WHERE user_id = $1 
      ORDER BY booking_date DESC, booking_time DESC`,
      [userId]
    );

    return NextResponse.json({ bookings: result.rows });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      serviceId, 
      serviceName, 
      servicePrice, 
      bookingDate, 
      bookingTime, 
      carModel, 
      carNumber,
      notes 
    } = body;

    // Проверка обязательных полей
    if (!serviceId || !serviceName || !servicePrice || !bookingDate || !bookingTime || !carModel || !carNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Проверка, что дата не в прошлом
    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return NextResponse.json({ error: 'Cannot book in the past' }, { status: 400 });
    }

    // Проверка, что время не занято
    const existingBooking = await query(
      `SELECT id FROM bookings 
       WHERE booking_date = $1 AND booking_time = $2 AND status != 'cancelled'`,
      [bookingDate, bookingTime]
    );

    if (existingBooking.rows.length > 0) {
      return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 });
    }

    // Создание бронирования
    const result = await query(
      `INSERT INTO bookings 
        (user_id, service_id, service_name, service_price, booking_date, booking_time, car_model, car_number, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
       RETURNING id, service_id, service_name, service_price, booking_date, booking_time, car_model, car_number, status, created_at`,
      [userId, serviceId, serviceName, servicePrice, bookingDate, bookingTime, carModel, carNumber, notes || null]
    );

    return NextResponse.json({ 
      message: 'Booking created successfully',
      booking: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Проверка, что бронирование принадлежит пользователю
    const booking = await query(
      'SELECT id FROM bookings WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    if (booking.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Отмена бронирования (мягкое удаление)
    await query(
      `UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [bookingId]
    );

    return NextResponse.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
