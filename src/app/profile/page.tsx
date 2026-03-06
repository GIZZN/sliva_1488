'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import Image from 'next/image';
import styles from './profile.module.css';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';

interface User {
  id: number;
  email: string;
  name: string;
  created_at?: string;
  imageUrl?: string;
  avatar_url?: string;
}

interface Booking {
  id: number;
  service_name: string;
  booking_date: string;
  booking_time: string;
  car_model: string;
  car_number: string;
  status: string;
  total_price: number;
  notes?: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkAuth = useCallback(async () => {
    // Сначала проверяем DB auth
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setDbUser(data.user);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('DB Auth check error:', error);
    }

    // Если DB auth не сработал, проверяем Clerk
    if (!isLoaded) return;

    if (clerkUser) {
      setDbUser({
        id: 0,
        name: clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress || 'Пользователь',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        created_at: clerkUser.createdAt?.toString(),
        imageUrl: clerkUser.imageUrl,
      });
      setLoading(false);
      return;
    }

    // Если ни один метод не сработал - редирект
    if (isLoaded) {
      router.push('/');
    }
  }, [isLoaded, clerkUser, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Загрузка записей пользователя
  useEffect(() => {
    const loadBookings = async () => {
      if (!dbUser || dbUser.id === 0) return; // Не загружаем для Clerk пользователей без DB ID
      
      setLoadingBookings(true);
      try {
        const response = await fetch('/api/bookings/user', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setBookings(data.bookings || []);
        }
      } catch (error) {
        console.error('Load bookings error:', error);
      } finally {
        setLoadingBookings(false);
      }
    };

    loadBookings();
  }, [dbUser]);

  const handleLogout = async () => {
    try {
      // Выход из DB сессии
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Выход из Clerk если залогинен
      if (clerkUser) {
        await signOut();
      }
      
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAvatarClick = () => {
    // Только для пользователей БД (не Clerk)
    if (!clerkUser && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 5MB');
      return;
    }

    // Проверка типа
    if (!file.type.startsWith('image/')) {
      alert('Можно загружать только изображения');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Конвертируем в base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        const response = await fetch('/api/auth/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ avatarUrl: base64 }),
        });

        if (response.ok) {
          const data = await response.json();
          setDbUser(prev => prev ? { ...prev, avatar_url: data.avatarUrl } : null);
        } else {
          alert('Ошибка при загрузке аватара');
        }
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Ошибка при загрузке аватара');
      setUploadingAvatar(false);
    }
  };

  if (loading || !dbUser) {
    return (
      <>
        <Header />
        <div className={styles.profileContainer}>
          <div className={styles.backgroundText}>Кристалл Авто</div>
          <div className={styles.backgroundText2}>Кристалл Авто</div>
          <div className={styles.backgroundText3}>Кристалл Авто</div>

          <div className={styles.contentWrapper}>
            <div className={styles.heroSection}>
              <div className={styles.userCard}>
                <div className={`${styles.userAvatar} ${styles.skeleton}`}></div>
                <div className={styles.userInfo}>
                  <div className={`${styles.skeletonText} ${styles.skeletonTitle}`}></div>
                  <div className={`${styles.skeletonText} ${styles.skeletonSubtitle}`}></div>
                  <div className={styles.userMeta}>
                    <div className={`${styles.skeletonText} ${styles.skeletonMeta}`}></div>
                  </div>
                </div>
              </div>

              <nav className={styles.nav}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`${styles.navButton} ${styles.skeleton}`}></div>
                ))}
                <div className={`${styles.logoutButton} ${styles.skeleton}`}></div>
              </nav>
            </div>

            <main className={styles.mainContent}>
              <div className={styles.statsGrid}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`${styles.statCard} ${styles.skeleton}`}>
                    <div className={styles.statIcon}></div>
                    <div className={styles.statContent}>
                      <div className={`${styles.skeletonText} ${styles.skeletonStatValue}`}></div>
                      <div className={`${styles.skeletonText} ${styles.skeletonStatLabel}`}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.skeletonText} ${styles.skeletonSectionTitle}`}></div>
                </div>
                <div className={styles.actionsGrid}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`${styles.actionCard} ${styles.skeleton}`}>
                      <div className={styles.actionIcon}></div>
                      <div className={`${styles.skeletonText} ${styles.skeletonActionTitle}`}></div>
                      <div className={`${styles.skeletonText} ${styles.skeletonActionDesc}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.profileContainer}>
        <div className={styles.backgroundText}>Кристалл Авто</div>
        <div className={styles.backgroundText2}>Кристалл Авто</div>
        <div className={styles.backgroundText3}>Кристалл Авто</div>

        <div className={styles.contentWrapper}>
          <div className={styles.heroSection}>
            <div className={styles.userCard}>
              <div 
                className={`${styles.userAvatar} ${!clerkUser ? styles.editable : ''}`}
                onClick={handleAvatarClick}
              >
                {uploadingAvatar && (
                  <div className={styles.avatarUploadOverlay}>
                    <div className={styles.avatarSpinner}></div>
                  </div>
                )}
                {dbUser.imageUrl || dbUser.avatar_url ? (
                  <Image 
                    src={dbUser.imageUrl || dbUser.avatar_url || ''} 
                    alt={dbUser.name}
                    width={120}
                    height={120}
                    className={styles.avatarImage}
                  />
                ) : (
                  dbUser.name.charAt(0).toUpperCase()
                )}
                {!clerkUser && (
                  <div className={styles.avatarEditIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                    </svg>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <div className={styles.userInfo}>
                <h1>{dbUser.name}</h1>
                <p>{dbUser.email}</p>
                {dbUser.created_at && (
                  <div className={styles.userMeta}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20Z" fill="currentColor"/>
                    </svg>
                    <span>Клиент с {new Date(dbUser.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>

            <nav className={styles.nav}>
              <button
                className={`${styles.navButton} ${activeSection === 'overview' ? styles.active : ''}`}
                onClick={() => setActiveSection('overview')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
                </svg>
                Обзор
              </button>
              <button
                className={`${styles.navButton} ${activeSection === 'profile' ? styles.active : ''}`}
                onClick={() => setActiveSection('profile')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                </svg>
                Профиль
              </button>
              <button
                className={`${styles.navButton} ${activeSection === 'bookings' ? styles.active : ''}`}
                onClick={() => setActiveSection('bookings')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20Z" fill="currentColor"/>
                </svg>
                Мои записи
              </button>
              <button
                className={`${styles.navButton} ${activeSection === 'activity' ? styles.active : ''}`}
                onClick={() => setActiveSection('activity')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11H7V13H9V11ZM13 11H11V13H13V11ZM17 11H15V13H17V11ZM19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor"/>
                </svg>
                История
              </button>
              <button
                className={`${styles.navButton} ${activeSection === 'settings' ? styles.active : ''}`}
                onClick={() => setActiveSection('settings')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
                </svg>
                Настройки
              </button>
              <button
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
                </svg>
                Выйти
              </button>
            </nav>
          </div>

          <main className={styles.mainContent}>
            {activeSection === 'overview' && (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className={styles.statContent}>
                      <div className={styles.statValue}>{bookings.length}</div>
                      <div className={styles.statLabel}>Всего записей</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M9 11H7V13H9V11ZM13 11H11V13H13V11ZM17 11H15V13H17V11ZM19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className={styles.statContent}>
                      <div className={styles.statValue}>{bookings.filter(b => b.status === 'pending' || b.status === 'confirmed' || b.status === 'approved').length}</div>
                      <div className={styles.statLabel}>Активных записей</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className={styles.statContent}>
                      <div className={styles.statValue}>{bookings.filter(b => b.status === 'completed').length}</div>
                      <div className={styles.statLabel}>Завершенных</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className={styles.statContent}>
                      <div className={styles.statValue}>{bookings.filter(b => b.status === 'cancelled').length}</div>
                      <div className={styles.statLabel}>Отмененных</div>
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2>Быстрые действия</h2>
                  </div>
                  <div className={styles.actionsGrid}>
                    <button className={styles.actionCard} onClick={() => router.push('/booking')}>
                      <div className={styles.actionIcon}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className={styles.actionTitle}>Новая запись</div>
                      <div className={styles.actionDesc}>Записаться на мойку</div>
                    </button>
                    <button className={styles.actionCard} onClick={() => setActiveSection('bookings')}>
                      <div className={styles.actionIcon}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className={styles.actionTitle}>Мои записи</div>
                      <div className={styles.actionDesc}>Просмотр всех записей</div>
                    </button>
                    <button className={styles.actionCard} onClick={() => setActiveSection('activity')}>
                      <div className={styles.actionIcon}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className={styles.actionTitle}>История</div>
                      <div className={styles.actionDesc}>Активность аккаунта</div>
                    </button>
                    <button className={styles.actionCard} onClick={() => setActiveSection('settings')}>
                      <div className={styles.actionIcon}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className={styles.actionTitle}>Настройки</div>
                      <div className={styles.actionDesc}>Управление аккаунтом</div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'profile' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Основная информация</h2>
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className={styles.infoContent}>
                      <label>Имя</label>
                      <p>{dbUser.name}</p>
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className={styles.infoContent}>
                      <label>Email</label>
                      <p>{dbUser.email}</p>
                    </div>
                  </div>
                  {dbUser.created_at && (
                    <div className={styles.infoCard}>
                      <div className={styles.infoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className={styles.infoContent}>
                        <label>Дата регистрации</label>
                        <p>{new Date(dbUser.created_at).toLocaleDateString('ru-RU')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'bookings' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Мои записи</h2>
                  <button 
                    className={styles.bookButton}
                    onClick={() => router.push('/booking')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                    </svg>
                    Новая запись
                  </button>
                </div>
                {loadingBookings ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <div className={styles.avatarSpinner}></div>
                    </div>
                    <h3>Загрузка записей...</h3>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                        <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <h3>У вас пока нет записей</h3>
                    <p>Запишитесь на мойку прямо сейчас</p>
                    <button 
                      className={styles.emptyButton}
                      onClick={() => router.push('/booking')}
                    >
                      Записаться
                    </button>
                  </div>
                ) : (
                  <div className={styles.bookingsList}>
                    {bookings.map((booking) => (
                      <div key={booking.id} className={styles.bookingCard}>
                        <div className={styles.bookingHeader}>
                          <div className={styles.bookingService}>{booking.service_name}</div>
                          <div className={`${styles.bookingStatus} ${styles[`status${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`]}`}>
                            {booking.status === 'pending' && 'Ожидает'}
                            {booking.status === 'confirmed' && 'Подтверждена'}
                            {booking.status === 'approved' && 'Одобрена'}
                            {booking.status === 'completed' && 'Завершена'}
                            {booking.status === 'cancelled' && 'Отменена'}
                          </div>
                        </div>
                        <div className={styles.bookingDetails}>
                          <div className={styles.bookingDetail}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20Z" fill="currentColor"/>
                            </svg>
                            <span>{new Date(booking.booking_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                          <div className={styles.bookingDetail}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
                            </svg>
                            <span>{booking.booking_time}</span>
                          </div>
                          <div className={styles.bookingDetail}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9V5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z" fill="currentColor"/>
                            </svg>
                            <span>{booking.car_model} ({booking.car_number})</span>
                          </div>
                          {booking.notes && (
                            <div className={styles.bookingDetail}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
                              </svg>
                              <span>{booking.notes}</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.bookingFooter}>
                          <div className={styles.bookingPrice}>{booking.total_price} ₽</div>
                          {booking.status === 'pending' && (
                            <button 
                              className={styles.cancelButton}
                              onClick={async () => {
                                if (confirm('Вы уверены, что хотите отменить запись?')) {
                                  try {
                                    const response = await fetch(`/api/bookings/${booking.id}`, {
                                      method: 'DELETE',
                                      credentials: 'include',
                                    });
                                    if (response.ok) {
                                      setBookings(bookings.filter(b => b.id !== booking.id));
                                    }
                                  } catch (error) {
                                    console.error('Cancel booking error:', error);
                                  }
                                }
                              }}
                            >
                              Отменить
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'activity' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>История активности</h2>
                </div>
                <div className={styles.timeline}>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineDot}></div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineTitle}>Регистрация аккаунта</div>
                      <div className={styles.timelineDesc}>Вы создали аккаунт в системе</div>
                      <div className={styles.timelineDate}>
                        {dbUser.created_at && new Date(dbUser.created_at).toLocaleDateString('ru-RU', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Настройки аккаунта</h2>
                </div>
                <div className={styles.settingsGrid}>
                  <div className={styles.settingCard}>
                    <div className={styles.settingHeader}>
                      <div className={styles.settingIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className={styles.settingInfo}>
                        <div className={styles.settingTitle}>Личная информация</div>
                        <div className={styles.settingDesc}>Управление именем и email</div>
                      </div>
                    </div>
                    <button className={styles.settingButton}>Изменить</button>
                  </div>
                  <div className={styles.settingCard}>
                    <div className={styles.settingHeader}>
                      <div className={styles.settingIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className={styles.settingInfo}>
                        <div className={styles.settingTitle}>Безопасность</div>
                        <div className={styles.settingDesc}>Пароль и двухфакторная аутентификация</div>
                      </div>
                    </div>
                    <button className={styles.settingButton}>Настроить</button>
                  </div>
                  <div className={styles.settingCard}>
                    <div className={styles.settingHeader}>
                      <div className={styles.settingIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 22C6.49 22 2 17.51 2 12C2 6.49 6.49 2 12 2C17.51 2 22 6.49 22 12C22 17.51 17.51 22 12 22ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className={styles.settingInfo}>
                        <div className={styles.settingTitle}>Уведомления</div>
                        <div className={styles.settingDesc}>Email и push уведомления</div>
                      </div>
                    </div>
                    <button className={styles.settingButton}>Управление</button>
                  </div>
                  <div className={styles.settingCard}>
                    <div className={styles.settingHeader}>
                      <div className={styles.settingIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className={styles.settingInfo}>
                        <div className={styles.settingTitle}>Конфиденциальность</div>
                        <div className={styles.settingDesc}>Управление данными и приватностью</div>
                      </div>
                    </div>
                    <button className={styles.settingButton}>Просмотр</button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
