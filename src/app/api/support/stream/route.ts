import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { clients } from '@/lib/sse-broadcast';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getUserFromToken(request: NextRequest): number | null {
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
  const userId = getUserFromToken(request);
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Добавляем клиента для конкретного пользователя
      if (!clients.has(userId)) {
        clients.set(userId, new Set());
      }
      clients.get(userId)!.add(controller);

      // Отправляем начальное сообщение
      const data = JSON.stringify({
        type: 'connected',
        timestamp: new Date().toISOString()
      });
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));

      // Heartbeat каждые 30 секунд
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Очистка при закрытии
      request.signal.addEventListener('abort', () => {
        const userClients = clients.get(userId);
        if (userClients) {
          userClients.delete(controller);
          if (userClients.size === 0) {
            clients.delete(userId);
          }
        }
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
