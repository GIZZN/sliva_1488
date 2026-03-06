import { NextRequest } from 'next/server';
import { query } from './db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return false;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const result = await query('SELECT is_admin FROM users WHERE id = $1', [decoded.userId]);
    return result.rows.length > 0 && result.rows[0].is_admin === true;
  } catch {
    return false;
  }
}
