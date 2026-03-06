'use client';

import { useState, useEffect, useRef } from 'react';
import { IoChatbubbleEllipsesSharp, IoClose, IoSend, IoCheckmarkDone } from 'react-icons/io5';
import { FaHeadset } from 'react-icons/fa';
import styles from './SupportChat.module.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'read';
}

interface DbMessage {
  id: number;
  message_text: string;
  sender: 'user' | 'support';
  created_at: string;
}

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    // Загружаем историю сообщений при открытии чата
    if (isOpen && messages.length <= 1) {
      loadChatHistory();
    }
    
    // Сбрасываем флаг прокрутки при открытии
    if (isOpen) {
      hasScrolledRef.current = false;
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      console.log('Loading chat history...');
      const response = await fetch('/api/support/messages');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded messages:', data.messages?.length || 0);
        
        if (data.messages && data.messages.length > 0) {
          const formattedMessages = data.messages.map((msg: DbMessage) => ({
            id: msg.id,
            text: msg.message_text,
            sender: msg.sender,
            timestamp: new Date(msg.created_at),
            status: 'read'
          }));
          console.log('Setting messages:', formattedMessages.length);
          setMessages(formattedMessages);
        } else {
          // Если нет истории, показываем приветствие
          console.log('No history, showing greeting');
          setMessages([
            {
              id: 1,
              text: 'Здравствуйте! Чем могу помочь?',
              sender: 'support',
              timestamp: new Date(),
              status: 'read'
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  useEffect(() => {
    // Подключение к SSE
    if (isOpen && !eventSourceRef.current) {
      connectSSE();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    // Прокручиваем вниз только один раз при открытии чата
    if (isOpen && messages.length > 0 && !hasScrolledRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        hasScrolledRef.current = true;
      }, 100);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    // Подсчет непрочитанных сообщений
    if (!isOpen) {
      const unread = messages.filter(
        m => m.sender === 'support' && m.status !== 'read'
      ).length;
      setUnreadCount(unread);
    } else {
      setUnreadCount(0);
      // Отметить все сообщения как прочитанные
      setMessages(prev => 
        prev.map(m => ({ ...m, status: 'read' }))
      );
    }
  }, [isOpen, messages]);

  const connectSSE = () => {
    const eventSource = new EventSource('/api/support/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('SSE connected');
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        // Добавляем сообщение только если его еще нет
        setMessages(prev => {
          const exists = prev.some(m => 
            m.text === data.text && 
            m.sender === 'support' && 
            Math.abs(new Date(m.timestamp).getTime() - new Date(data.timestamp).getTime()) < 1000
          );
          
          if (exists) return prev;
          
          return [...prev, {
            id: Date.now(),
            text: data.text,
            sender: 'support',
            timestamp: new Date(data.timestamp),
            status: isOpen ? 'read' : 'sent'
          }];
        });
      } else if (data.type === 'typing') {
        setIsTyping(data.isTyping);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      eventSourceRef.current = null;
      
      // Переподключение через 3 секунды
      setTimeout(() => {
        if (isOpen) {
          connectSSE();
        }
      }, 3000);
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    try {
      const response = await fetch('/api/support/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText,
          sender: 'user'
        })
      });

      if (response.ok) {
        setMessages(prev => 
          prev.map(m => 
            m.id === newMessage.id 
              ? { ...m, status: 'sent' }
              : m
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        className={`${styles.chatButton} ${isOpen ? styles.hidden : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Открыть чат поддержки"
      >
        <IoChatbubbleEllipsesSharp size={28} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.avatarWrapper}>
                <FaHeadset size={24} />
                <span className={`${styles.statusDot} ${isConnected ? styles.online : styles.offline}`}></span>
              </div>
              <div className={styles.headerInfo}>
                <h3>Поддержка</h3>
                <span className={styles.status}>
                  {isConnected ? 'Онлайн' : 'Оффлайн'}
                </span>
              </div>
            </div>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть чат"
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.sender === 'user' ? styles.userMessage : styles.supportMessage
                }`}
              >
                <div className={styles.messageContent}>
                  <p>{message.text}</p>
                  <div className={styles.messageFooter}>
                    <span className={styles.timestamp}>
                      {formatTime(message.timestamp)}
                    </span>
                    {message.sender === 'user' && message.status && (
                      <span className={styles.messageStatus}>
                        {message.status === 'sending' && '⏱'}
                        {message.status === 'sent' && <IoCheckmarkDone />}
                        {message.status === 'read' && <IoCheckmarkDone style={{ color: '#00ff00' }} />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className={`${styles.message} ${styles.supportMessage}`}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputContainer}>
            <textarea
              className={styles.input}
              placeholder="Напишите сообщение..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              aria-label="Отправить сообщение"
            >
              <IoSend size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
