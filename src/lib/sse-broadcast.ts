// Хранилище активных подключений с user_id
export const clients = new Map<number, Set<ReadableStreamDefaultController>>();

// Функция для отправки сообщений конкретному пользователю
export function broadcastMessage(
  message: { type: string; text?: string; isTyping?: boolean; timestamp?: string },
  targetUserId?: number
) {
  const encoder = new TextEncoder();
  const data = JSON.stringify(message);
  
  if (targetUserId) {
    // Отправляем только конкретному пользователю
    const userClients = clients.get(targetUserId);
    if (userClients) {
      userClients.forEach((controller) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          userClients.delete(controller);
        }
      });
    }
  } else {
    // Отправляем всем (для обратной совместимости)
    clients.forEach((userClients) => {
      userClients.forEach((controller) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          userClients.delete(controller);
        }
      });
    });
  }
}
