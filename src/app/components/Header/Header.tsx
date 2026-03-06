'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import styles from './Header.module.css';
import AuthModal from './AuthModal';

interface User {
  id: number;
  email: string;
  name: string;
  is_admin?: boolean;
  avatar_url?: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setDbUser(data.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setDbUser(data.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    if (isSignedIn && clerkUser) {
      setIsAuthModalOpen(false);
      checkAuth();
    }
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setDbUser(null);
      
      if (isSignedIn) {
        await signOut();
      }
      
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const user = clerkUser ? {
    name: clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress || 'Профиль',
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    imageUrl: clerkUser.imageUrl,
  } : dbUser ? {
    name: dbUser.name,
    email: dbUser.email,
    imageUrl: dbUser.avatar_url || undefined,
  } : null;

  const isAuthenticated = isSignedIn || !!dbUser;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Кристалл Авто
        </Link>

        <nav className={styles.nav}>
          <Link href="/#services" className={styles.navLink}>
            Услуги
          </Link>
          <Link href="/#prices" className={styles.navLink}>
            Цены
          </Link>
          <Link href="/about" className={styles.navLink}>
            О нас
          </Link>
          <Link href="/contacts" className={styles.navLink}>
            Контакты
          </Link>
        </nav>

        <div className={styles.authButtons}>
          {!isAuthenticated ? (
            <>
              <button onClick={() => setIsAuthModalOpen(true)} className={styles.loginButton}>
                Войти
              </button>
              <Link href="/booking" className={styles.downloadButton}>
                Записаться
              </Link>
            </>
          ) : (
            <>
              <Link href="/booking" className={styles.downloadButton}>
                Записаться
              </Link>
              <div className={styles.profileWrapper} ref={profileMenuRef}>
                <button 
                  className={styles.profileButton}
                  onClick={toggleProfileMenu}
                  aria-label="Профиль"
                >
                  <div className={styles.avatarContainer}>
                    {user?.imageUrl ? (
                      <>
                        {!imageLoaded && <div className={styles.avatarSkeleton} />}
                        <Image 
                          src={user.imageUrl} 
                          alt={user.name}
                          width={40}
                          height={40}
                          className={`${styles.avatar} ${imageLoaded ? styles.loaded : ''}`}
                          onLoad={() => setImageLoaded(true)}
                          loading="lazy"
                        />
                      </>
                    ) : (
                      <div className={styles.avatarLetter}>
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className={styles.profileMenu}>
                    <div className={styles.profileMenuHeader}>
                      <div className={styles.profileMenuAvatar}>
                        {user?.imageUrl ? (
                          <Image 
                            src={user.imageUrl} 
                            alt={user.name}
                            width={48}
                            height={48}
                          />
                        ) : (
                          <div className={styles.profileMenuLetter}>
                            {user?.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={styles.profileMenuInfo}>
                        <div className={styles.profileMenuName}>{user?.name}</div>
                        <div className={styles.profileMenuEmail}>{user?.email}</div>
                      </div>
                    </div>
                    <div className={styles.profileMenuDivider} />
                    <Link href="/profile" className={styles.profileMenuItem} onClick={() => setIsProfileMenuOpen(false)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                      </svg>
                      Мой профиль
                    </Link>
                    <Link href="/booking" className={styles.profileMenuItem} onClick={() => setIsProfileMenuOpen(false)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20Z" fill="currentColor"/>
                      </svg>
                      Мои записи
                    </Link>
                    {dbUser?.is_admin && (
                      <Link href="/admin" className={styles.profileMenuItem} onClick={() => setIsProfileMenuOpen(false)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="currentColor"/>
                        </svg>
                        Админ-панель
                      </Link>
                    )}
                    <div className={styles.profileMenuDivider} />
                    <button className={styles.profileMenuItem} onClick={handleLogout}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
                      </svg>
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          className={`${styles.burgerButton} ${isMenuOpen ? styles.active : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
        </button>
      </header>

      {isMenuOpen && (
        <div className={styles.menuOverlay} onClick={closeMenu}>
          <div className={styles.menuPopup} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeMenu} aria-label="Close menu" />
            
            <div className={styles.menuContent}>
              {user && (
                <div className={styles.userProfile}>
                  <div className={styles.userAvatar}>
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt={user.name} />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>{user.name}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </div>
                </div>
              )}

              <nav className={styles.menuNav}>
                <Link href="/#services" className={styles.menuNavLink} onClick={closeMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2L2 7V13C2 19.5 6.5 25.5 12 27C17.5 25.5 22 19.5 22 13V7L12 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Услуги
                </Link>
                <Link href="/#prices" className={styles.menuNavLink} onClick={closeMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Цены
                </Link>
                <Link href="/about" className={styles.menuNavLink} onClick={closeMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  О нас
                </Link>
                <Link href="/contacts" className={styles.menuNavLink} onClick={closeMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Контакты
                </Link>
                {dbUser?.is_admin && (
                  <Link href="/admin" className={styles.menuNavLink} onClick={closeMenu}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Админ-панель
                  </Link>
                )}
              </nav>

              <div className={styles.menuActions}>
                {user ? (
                  <>
                    <Link href="/booking" className={`${styles.menuButton} ${styles.menuButtonPrimary}`} onClick={closeMenu}>
                      Записаться
                    </Link>
                    <Link href="/profile" className={`${styles.menuButton} ${styles.menuButtonSecondary}`} onClick={closeMenu}>
                      Мой профиль
                    </Link>
                    <button className={`${styles.menuButton} ${styles.menuButtonLogout}`} onClick={handleLogout}>
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/booking" className={`${styles.menuButton} ${styles.menuButtonPrimary}`} onClick={closeMenu}>
                      Записаться
                    </Link>
                    <button 
                      onClick={() => {
                        closeMenu();
                        setIsAuthModalOpen(true);
                      }} 
                      className={`${styles.menuButton} ${styles.menuButtonSecondary}`}
                    >
                      Войти
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
}
