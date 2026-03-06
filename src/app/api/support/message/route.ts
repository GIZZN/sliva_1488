import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { broadcastMessage } from '@/lib/sse-broadcast';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Симуляция автоответов поддержки (только для специфических запросов)
const AUTO_RESPONSES: Record<string, string> = {
  'привет': 'Здравствуйте! Рад помочь вам. Что вас интересует?',
  'цена': 'Наши цены: Экспресс-мойка - 600₽, Комплексная мойка - 1500₽, VIP детейлинг - 3000₽',
  'время': 'Мы работаем ежедневно с 8:00 до 23:00',
  'адрес': 'У нас 3 локации: Центральная (ул. Ленина, 45), Северная (пр. Мира, 128), Южная (ул. Победы, 89)',
  'запись': 'Вы можете записаться онлайн на странице "Запись" или позвонить нам по телефону +7 (999) 123-45-67',
  'спасибо': 'Пожалуйста! Рад был помочь. Обращайтесь, если возникнут вопросы!'
};

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

export async function POST(request: NextRequest) {
  try {
    const { text, sender } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const userId = getUserFromToken(request);
    
    // Сохраняем сообщение пользователя в БД
    if (userId) {
      await query(
        `INSERT INTO support_messages (user_id, message_text, sender, status)
         VALUES ($1, $2, $3, 'sent')`,
        [userId, text, sender || 'user']
      );
    }

    // Проверяем, есть ли автоответ для этого сообщения
    const autoResponse = getAutoResponse(text.toLowerCase());
    
    // Отправляем автоответ только если он найден
    if (autoResponse) {
      setTimeout(() => {
        broadcastTyping(true, userId);

        setTimeout(() => {
          broadcastTyping(false, userId);
          broadcastSupportMessage(autoResponse, userId);
        }, 1500);
      }, 500);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getAutoResponse(text: string): string | null {
  for (const [keyword, response] of Object.entries(AUTO_RESPONSES)) {
    if (text.includes(keyword)) {
      return response;
    }
  }
  return null; // Не отправляем дефолтный ответ
}

function broadcastTyping(isTyping: boolean, userId: number | null) {
  if (!userId) return;
  
  broadcastMessage({
    type: 'typing',
    isTyping,
    timestamp: new Date().toISOString()
  }, userId);
}

async function broadcastSupportMessage(text: string, userId: number | null) {
  // Сохраняем ответ поддержки в БД
  if (userId) {
    await query(
      `INSERT INTO support_messages (user_id, message_text, sender, status)
       VALUES ($1, $2, 'support', 'sent')`,
      [userId, text]
    );
  }

  broadcastMessage({
    type: 'message',
    text,
    timestamp: new Date().toISOString()
  }, userId ?? undefined);
}
