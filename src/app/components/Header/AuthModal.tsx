'use client';

import { useSignIn, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn } = useSignIn();
  const { user: clerkUser, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const googleBtnRef = useRef<HTMLButtonElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkIfAuthenticated = async () => {
      if (!isLoaded) return;

      if (clerkUser) {
        onClose();
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          onClose();
          return;
        }
      } catch {
        // Продолжаем показывать модалку
      } finally {
        setChecking(false);
      }
    };

    checkIfAuthenticated();
  }, [isLoaded, clerkUser, onClose]);

  // Проверяем, вернулись ли мы после OAuth
  useEffect(() => {
    const afterOAuth = searchParams.get('after_oauth');
    if (afterOAuth === 'true' && isLoaded && clerkUser) {
      // Убираем параметр из URL
      const url = new URL(window.location.href);
      url.searchParams.delete('after_oauth');
      window.history.replaceState({}, '', url.toString());
      
      // Закрываем модалку
      onClose();
    }
  }, [searchParams, isLoaded, clerkUser, onClose]);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!signIn) {
        setError('Ошибка инициализации');
        setLoading(false);
        return;
      }

      // Добавляем параметр в URL для отслеживания возврата после OAuth
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('after_oauth', 'true');

      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: currentUrl.toString(),
        redirectUrlComplete: currentUrl.toString(),
      });
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || 'Ошибка авторизации через Google');
      setLoading(false);
    }
  };

  const handleGoogleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const fill = button.querySelector(`.${styles.googleBtnFill}`) as HTMLElement;
    
    if (fill) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      gsap.killTweensOf(fill);
      
      gsap.set(fill, {
        left: x,
        top: y,
        xPercent: -50,
        yPercent: -50,
        scale: 0,
      });
      
      gsap.to(fill, {
        scale: 3,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  const handleGoogleMouseLeave = () => {
    if (googleBtnRef.current) {
      const fill = googleBtnRef.current.querySelector(`.${styles.googleBtnFill}`) as HTMLElement;
      if (fill) {
        gsap.killTweensOf(fill);
        
        gsap.to(fill, {
          scale: 0,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    }
  };

  const handleSubmitMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const fill = button.querySelector(`.${styles.submitBtnFill}`) as HTMLElement;
    
    if (fill) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      gsap.killTweensOf(fill);
      
      gsap.set(fill, {
        left: x,
        top: y,
        xPercent: -50,
        yPercent: -50,
        scale: 0,
      });
      
      gsap.to(fill, {
        scale: 3,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  const handleSubmitMouseLeave = () => {
    if (submitBtnRef.current) {
      const fill = submitBtnRef.current.querySelector(`.${styles.submitBtnFill}`) as HTMLElement;
      if (fill) {
        gsap.killTweensOf(fill);
        
        gsap.to(fill, {
          scale: 0,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    }
  };

  const handleCustomAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password }
        : { email, password, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка');
        setLoading(false);
        return;
      }

      // Закрываем модалку и перезагружаем страницу для обновления состояния
      onClose();
      window.location.reload();
    } catch {
      setError('Ошибка подключения к серверу');
      setLoading(false);
    }
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isLoaded || checking) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div style={{ textAlign: 'center', color: '#000', fontSize: '1.2rem' }}>
            Загрузка...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={handleModalClick}>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className={styles.header}>
          <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
          <p>Кристалл Авто</p>
        </div>

        <div className={styles.tabs}>
          <div className={`${styles.tabIndicator} ${!isLogin ? styles.right : ''}`}></div>
          <button
            className={`${styles.tab} ${isLogin ? styles.active : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Вход
          </button>
          <button
            className={`${styles.tab} ${!isLogin ? styles.active : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Регистрация
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button 
          ref={googleBtnRef}
          className={styles.googleBtn}
          onClick={handleGoogleAuth}
          onMouseEnter={handleGoogleMouseEnter}
          onMouseLeave={handleGoogleMouseLeave}
        >
          <span className={styles.googleBtnFill}></span>
          <span className={styles.googleBtnContent}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Войти через Google
          </span>
        </button>

        <div className={styles.divider}>
          <span>или</span>
        </div>

        <form onSubmit={handleCustomAuth} className={styles.form}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                required={!isLogin}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 8 символов"
              required
              minLength={8}
            />
          </div>

          <button 
            ref={submitBtnRef}
            type="submit" 
            className={styles.submitBtn} 
            disabled={loading}
            onMouseEnter={handleSubmitMouseEnter}
            onMouseLeave={handleSubmitMouseLeave}
          >
            <span className={styles.submitBtnFill}></span>
            <span className={styles.submitBtnContent}>
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
