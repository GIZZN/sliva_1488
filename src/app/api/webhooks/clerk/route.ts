import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: {
    type: string;
    data: {
      id?: string;
      email_addresses?: Array<{ email_address: string }>;
      first_name?: string;
      last_name?: string;
      phone_numbers?: Array<{ phone_number: string }>;
    };
  };

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as typeof evt;
  } catch (err: unknown) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;

    try {
      await query(
        `INSERT INTO users (clerk_id, email, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (clerk_id) DO NOTHING`,
        [
          id || '',
          email_addresses?.[0]?.email_address || '',
          first_name || '',
          last_name || '',
          phone_numbers?.[0]?.phone_number || null,
        ]
      );
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;

    try {
      await query(
        `UPDATE users 
         SET email = $2, first_name = $3, last_name = $4, phone = $5
         WHERE clerk_id = $1`,
        [
          id || '',
          email_addresses?.[0]?.email_address || '',
          first_name || '',
          last_name || '',
          phone_numbers?.[0]?.phone_number || null,
        ]
      );
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await query('DELETE FROM users WHERE clerk_id = $1', [id || '']);
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
}
