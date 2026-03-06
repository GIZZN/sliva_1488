'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { 
  IoChatbubbles, 
  IoMail, 
  IoCalendar, 
  IoSettings,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoPricetag
} from 'react-icons/io5';
import styles from './admin.module.css';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
}

interface Booking {
  id: number;
  user_id: number;
  service_name: string;
  service_price: number;
  booking_date: string;
  booking_time: string;
  car_model: string;
  car_number: string;
  status: string;
  created_at: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string;
  is_active: boolean;
}

interface ChatMessage {
  id: number;
  user_id: number;
  message_text: string;
  sender: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface ChatUser {
  user_id: number;
  user_email: string;
  user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

type TabType = 'bookings' | 'contacts' | 'chat' | 'services';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  
  // Notifications
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [unreadContactsCount, setUnreadContactsCount] = useState(0);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      const interval = setInterval(() => {
        // Обновляем данные в зависимости от активной вкладки
        if (activeTab === 'chat' && selectedUserId) {
          // Если открыт чат, обновляем только сообщения текущего пользователя
          fetchChatMessagesForUser(selectedUserId);
        } else {
          // Для других вкладок обновляем все данные
          fetchData();
        }
      }, 3000); // Обновление каждые 3 секунды для реального времени
      return () => clearInterval(interval);
    }
  }, [isAdmin, activeTab, selectedUserId]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        // Проверка на админа через поле is_admin
        if (data.user.is_admin) {
          setIsAdmin(true);
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    switch (activeTab) {
      case 'bookings':
        await fetchBookings();
        break;
      case 'contacts':
        await fetchContacts();
        break;
      case 'chat':
        await fetchChatMessages();
        break;
      case 'services':
        await fetchServices();
        break;
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
        setPendingBookingsCount(data.bookings.filter((b: Booking) => b.status === 'pending').length);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/admin/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
        setUnreadContactsCount(data.contacts.filter((c: ContactMessage) => c.status === 'new').length);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await fetch('/api/admin/chat');
      if (response.ok) {
        const data = await response.json();
        setChatUsers(data.users || []);
        
        // Автоматически выбираем первого пользователя
        if (data.users && data.users.length > 0 && !selectedUserId) {
          setSelectedUserId(data.users[0].user_id);
        }
        
        // Загружаем сообщения выбранного пользователя
        if (selectedUserId) {
          await fetchChatMessagesForUser(selectedUserId);
        }
        
        setUnreadChatsCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const fetchChatMessagesForUser = async (userId: number) => {
    try {
      const messagesResponse = await fetch(`/api/admin/chat/user/${userId}`);
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setChatMessages(messagesData.messages);
      }
    } catch (error) {
      console.error('Error fetching user messages:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleApproveBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' })
      });
      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error approving booking:', error);
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  const handleMarkContactAsRead = async (contactId: number) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' })
      });
      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error('Error marking contact as read:', error);
    }
  };

  const handleUpdateService = async (serviceId: number, updates: Partial<Service>) => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        fetchServices();
      }
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleSendChatMessage = async (text: string) => {
    if (!text.trim() || !selectedUserId) return;

    try {
      const response = await fetch('/api/admin/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userId: selectedUserId })
      });
      if (response.ok) {
        // Сразу обновляем сообщения после отправки
        await fetchChatMessagesForUser(selectedUserId);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  const handleSelectUser = async (userId: number) => {
    setSelectedUserId(userId);
    await fetchChatMessagesForUser(userId);
  };

  const handleDeleteChat = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить всю историю чата с этим пользователем?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/chat/user/${userId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Если удаляем текущий чат, сбрасываем выбор
        if (selectedUserId === userId) {
          setSelectedUserId(null);
          setChatMessages([]);
        }
        // Обновляем список пользователей
        fetchChatMessages();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className={styles.loading}>Загрузка...</div>
      </>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Панель администратора</h1>
            <div className={styles.notifications}>
              {pendingBookingsCount > 0 && (
                <div className={styles.notificationBadge}>
                  <IoCalendar />
                  <span>{pendingBookingsCount} новых записей</span>
                </div>
              )}
              {unreadContactsCount > 0 && (
                <div className={styles.notificationBadge}>
                  <IoMail />
                  <span>{unreadContactsCount} новых сообщений</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'bookings' ? styles.active : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <IoCalendar />
              Записи
              {pendingBookingsCount > 0 && <span className={styles.badge}>{pendingBookingsCount}</span>}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'contacts' ? styles.active : ''}`}
              onClick={() => setActiveTab('contacts')}
            >
              <IoMail />
              Контакты
              {unreadContactsCount > 0 && <span className={styles.badge}>{unreadContactsCount}</span>}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'chat' ? styles.active : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <IoChatbubbles />
              Чат
              {unreadChatsCount > 0 && <span className={styles.badge}>{unreadChatsCount}</span>}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'services' ? styles.active : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <IoSettings />
              Услуги
            </button>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className={styles.bookingsTab}>
                <h2>Управление записями</h2>
                {bookings.length === 0 ? (
                  <p className={styles.emptyState}>Нет записей</p>
                ) : (
                  <div className={styles.bookingsList}>
                    {bookings.map(booking => (
                      <div key={booking.id} className={styles.bookingCard}>
                        <div className={styles.bookingHeader}>
                          <div>
                            <h3>{booking.service_name}</h3>
                            <p className={styles.bookingDate}>
                              {new Date(booking.booking_date).toLocaleDateString('ru-RU')} в {booking.booking_time}
                            </p>
                          </div>
                          <span className={`${styles.statusBadge} ${styles[booking.status]}`}>
                            {booking.status === 'pending' && 'Ожидает'}
                            {booking.status === 'confirmed' && 'Подтверждено'}
                            {booking.status === 'cancelled' && 'Отменено'}
                            {booking.status === 'completed' && 'Завершено'}
                          </span>
                        </div>
                        <div className={styles.bookingDetails}>
                          <p><strong>Автомобиль:</strong> {booking.car_model} ({booking.car_number})</p>
                          <p><strong>Стоимость:</strong> {booking.service_price}₽</p>
                          <p><strong>Создано:</strong> {formatDate(booking.created_at)}</p>
                        </div>
                        {booking.status === 'pending' && (
                          <div className={styles.bookingActions}>
                            <button
                              className={styles.approveBtn}
                              onClick={() => handleApproveBooking(booking.id)}
                            >
                              <IoCheckmarkCircle />
                              Подтвердить
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => handleRejectBooking(booking.id)}
                            >
                              <IoCloseCircle />
                              Отклонить
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div className={styles.contactsTab}>
                <h2>Сообщения с формы контактов</h2>
                {contacts.length === 0 ? (
                  <p className={styles.emptyState}>Нет сообщений</p>
                ) : (
                  <div className={styles.contactsList}>
                    {contacts.map(contact => (
                      <div key={contact.id} className={`${styles.contactCard} ${contact.status === 'new' ? styles.unread : ''}`}>
                        <div className={styles.contactHeader}>
                          <div>
                            <h3>{contact.name}</h3>
                            <p>{contact.email} • {contact.phone}</p>
                          </div>
                          <span className={styles.contactDate}>{formatDate(contact.created_at)}</span>
                        </div>
                        <p className={styles.contactMessage}>{contact.message}</p>
                        {contact.status === 'new' && (
                          <button
                            className={styles.markReadBtn}
                            onClick={() => handleMarkContactAsRead(contact.id)}
                          >
                            Отметить как прочитанное
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className={styles.chatTab}>
                <h2>Чат поддержки</h2>
                {chatUsers.length === 0 ? (
                  <p className={styles.emptyState}>Нет активных чатов</p>
                ) : (
                  <div className={styles.chatLayout}>
                    {/* Users List */}
                    <div className={styles.chatUsersList}>
                      <h3>Активные чаты</h3>
                      <div className={styles.usersContainer}>
                        {chatUsers.map(user => (
                          <div
                            key={user.user_id}
                            className={`${styles.userItem} ${selectedUserId === user.user_id ? styles.active : ''}`}
                          >
                            <div 
                              className={styles.userItemContent}
                              onClick={() => handleSelectUser(user.user_id)}
                            >
                              <div className={styles.userAvatar}>
                                {user.user_name.charAt(0).toUpperCase()}
                              </div>
                              <div className={styles.userInfo}>
                                <div className={styles.userName}>{user.user_name}</div>
                                <div className={styles.userLastMessage}>{user.last_message}</div>
                              </div>
                              {user.unread_count > 0 && (
                                <div className={styles.unreadBadge}>{user.unread_count}</div>
                              )}
                            </div>
                            <button
                              className={styles.deleteUserBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(user.user_id);
                              }}
                              title="Удалить чат"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chat Interface */}
                    <div className={styles.chatInterface}>
                      {selectedUserId ? (
                        <>
                          <div className={styles.chatMessagesContainer}>
                            {chatMessages.map(msg => (
                              <div key={msg.id} className={`${styles.chatMessageBubble} ${styles[msg.sender]}`}>
                                <div className={styles.chatMessageHeader}>
                                  <strong>{msg.sender === 'user' ? msg.user_name || 'Пользователь' : 'Поддержка'}</strong>
                                  <span>{formatDate(msg.created_at)}</span>
                                </div>
                                <p>{msg.message_text}</p>
                              </div>
                            ))}
                          </div>
                          <div className={styles.chatInputContainer}>
                            <textarea
                              className={styles.chatInput}
                              placeholder="Напишите ответ..."
                              rows={2}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendChatMessage(e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                            <button
                              className={styles.chatSendBtn}
                              onClick={(e) => {
                                const textarea = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                                handleSendChatMessage(textarea.value);
                                textarea.value = '';
                              }}
                            ></button>
                          </div>
                        </>
                      ) : (
                        <div className={styles.noChatSelected}>
                          <p>Выберите чат для начала общения</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Replies */}
                    <div className={styles.quickReplies}>
                      <h3>Шаблоны ответов</h3>
                      <div className={styles.quickReplysList}>
                        <button 
                          className={styles.quickReplyBtn}
                          onClick={() => handleSendChatMessage('Здравствуйте! Благодарим за обращение. Чем могу помочь?')}
                          disabled={!selectedUserId}
                        >
                          <div className={styles.quickReplyTitle}>Приветствие</div>
                          <div className={styles.quickReplyPreview}>Здравствуйте! Благодарим за обращение...</div>
                        </button>
                        <button 
                          className={styles.quickReplyBtn}
                          onClick={() => handleSendChatMessage('Наши услуги:\n• Экспресс-мойка - 600₽ (30 мин)\n• Комплексная мойка - 1500₽ (90 мин)\n• VIP детейлинг - 3000₽ (180 мин)')}
                          disabled={!selectedUserId}
                        >
                          <div className={styles.quickReplyTitle}>Прайс-лист</div>
                          <div className={styles.quickReplyPreview}>Наши услуги: Экспресс-мойка...</div>
                        </button>
                        <button 
                          className={styles.quickReplyBtn}
                          onClick={() => handleSendChatMessage('Мы работаем ежедневно с 8:00 до 23:00 без выходных.')}
                          disabled={!selectedUserId}
                        >
                          <div className={styles.quickReplyTitle}>Режим работы</div>
                          <div className={styles.quickReplyPreview}>Мы работаем ежедневно с 8:00...</div>
                        </button>
                        <button 
                          className={styles.quickReplyBtn}
                          onClick={() => handleSendChatMessage('Наши адреса:\n• Центральная: ул. Ленина, 45\n• Северная: пр. Мира, 128\n• Южная: ул. Победы, 89')}
                          disabled={!selectedUserId}
                        >
                          <div className={styles.quickReplyTitle}>Адреса филиалов</div>
                          <div className={styles.quickReplyPreview}>Наши адреса: Центральная...</div>
                        </button>
                        <button 
                          className={styles.quickReplyBtn}
                          onClick={() => handleSendChatMessage('Для записи перейдите на страницу "Запись" на нашем сайте или позвоните по телефону +7 (999) 123-45-67')}
                          disabled={!selectedUserId}
                        >
                          <div className={styles.quickReplyTitle}>Как записаться</div>
                          <div className={styles.quickReplyPreview}>Для записи перейдите на страницу...</div>
                        </button>
                        <button 
                          className={styles.quickReplyBtn}
                          onClick={() => handleSendChatMessage('Спасибо за обращение! Если возникнут дополнительные вопросы - всегда рады помочь.')}
                          disabled={!selectedUserId}
                        >
                          <div className={styles.quickReplyTitle}>Завершение диалога</div>
                          <div className={styles.quickReplyPreview}>Спасибо за обращение! Если возникнут...</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className={styles.servicesTab}>
                <h2>Управление услугами</h2>
                {services.length === 0 ? (
                  <p className={styles.emptyState}>Нет услуг</p>
                ) : (
                  <div className={styles.servicesList}>
                    {services.map(service => (
                      <div key={service.id} className={styles.serviceCard}>
                        <div className={styles.serviceHeader}>
                          <h3>{service.name}</h3>
                          <label className={styles.switch}>
                            <input
                              type="checkbox"
                              checked={service.is_active}
                              onChange={(e) => handleUpdateService(service.id, { is_active: e.target.checked })}
                            />
                            <span className={styles.slider}></span>
                          </label>
                        </div>
                        <p className={styles.serviceDescription}>{service.description}</p>
                        <div className={styles.serviceInputs}>
                          <div className={styles.inputGroup}>
                            <label>
                              <IoPricetag />
                              Цена (₽)
                            </label>
                            <input
                              type="number"
                              value={service.price}
                              onChange={(e) => handleUpdateService(service.id, { price: parseInt(e.target.value) })}
                            />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>Длительность (мин)</label>
                            <input
                              type="number"
                              value={service.duration}
                              onChange={(e) => handleUpdateService(service.id, { duration: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
