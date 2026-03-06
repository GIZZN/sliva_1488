'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from './about.module.css';
import { gsap } from 'gsap';

interface Testimonial {
  id: number;
  author_name: string;
  avatar_url: string | null;
  car_brand: string | null;
  car_model: string | null;
  rating: number;
  text: string;
  created_at: string;
}

const Icons = {
  Users: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Star: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Tool: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
      <path d="M14.7 6.3C14.3 5.9 13.7 5.9 13.3 6.3L11.3 8.3C10.9 8.7 10.9 9.3 11.3 9.7L14.3 12.7C14.7 13.1 15.3 13.1 15.7 12.7L17.7 10.7C18.1 10.3 18.1 9.7 17.7 9.3L14.7 6.3ZM6.3 14.7C5.9 14.3 5.9 13.7 6.3 13.3L8.3 11.3C8.7 10.9 9.3 10.9 9.7 11.3L12.7 14.3C13.1 14.7 13.1 15.3 12.7 15.7L10.7 17.7C10.3 18.1 9.7 18.1 9.3 17.7L6.3 14.7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.5 14.5L14.5 9.5M21 3L18 6M3 21L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Car: () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
      <path d="M5 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V11L4.48 5.212C4.63893 4.85144 4.90337 4.54744 5.23995 4.34067C5.57654 4.1339 5.96911 4.03404 6.367 4.053L17.633 4.053C18.0309 4.03404 18.4235 4.1339 18.76 4.34067C19.0966 4.54744 19.3611 4.85144 19.52 5.212L22 11V15C22 15.5304 21.7893 16.0391 21.4142 16.4142C21.0391 16.7893 20.5304 17 20 17H19M5 17C5 17.7956 5.31607 18.5587 5.87868 19.1213C6.44129 19.6839 7.20435 20 8 20C8.79565 20 9.55871 19.6839 10.1213 19.1213C10.6839 18.5587 11 17.7956 11 17M5 17C5 16.2044 5.31607 15.4413 5.87868 14.8787C6.44129 14.3161 7.20435 14 8 14C8.79565 14 9.55871 14.3161 10.1213 14.8787C10.6839 15.4413 11 16.2044 11 17M19 17C19 17.7956 18.6839 18.5587 18.1213 19.1213C17.5587 19.6839 16.7956 20 16 20C15.2044 20 14.4413 19.6839 13.8787 19.1213C13.3161 18.5587 13 17.7956 13 17M19 17C19 16.2044 18.6839 15.4413 18.1213 14.8787C17.5587 14.3161 16.7956 14 16 14C15.2044 14 14.4413 14.3161 13.8787 14.8787C13.3161 15.4413 13 16.2044 13 17M11 17H13M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Science: () => (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <path d="M9 3V9M15 3V15M9 21V15M15 21V15M9 9C9 10.6569 7.65685 12 6 12C4.34315 12 3 10.6569 3 9C3 7.34315 4.34315 6 6 6C7.65685 6 9 7.34315 9 9ZM21 15C21 16.6569 19.6569 18 18 18C16.3431 18 15 16.6569 15 15C15 13.3431 16.3431 12 18 12C19.6569 12 21 13.3431 21 15ZM15 9C15 10.6569 13.6569 12 12 12C10.3431 12 9 10.6569 9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9ZM9 15C9 16.6569 7.65685 18 6 18C4.34315 18 3 16.6569 3 15C3 13.3431 4.34315 12 6 12C7.65685 12 9 13.3431 9 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Droplet: () => (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <path d="M12 2.69L17.66 8.35C18.5 9.19 19.16 10.21 19.58 11.33C20 12.45 20.17 13.64 20.08 14.83C19.99 16.02 19.64 17.17 19.06 18.21C18.48 19.25 17.68 20.16 16.71 20.88C15.74 21.6 14.63 22.11 13.45 22.38C12.27 22.65 11.05 22.67 9.86 22.44C8.67 22.21 7.54 21.74 6.55 21.06C5.56 20.38 4.73 19.5 4.12 18.48C3.51 17.46 3.13 16.32 3.01 15.14C2.89 13.96 3.03 12.77 3.42 11.65C3.81 10.53 4.44 9.5 5.27 8.63L12 2.69Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Zap: () => (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Cpu: () => (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 1V4M15 1V4M9 20V23M15 20V23M20 9H23M20 14H23M1 9H4M1 14H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Trophy: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
      <path d="M6 9H4.5C3.83696 9 3.20107 9.26339 2.73223 9.73223C2.26339 10.2011 2 10.837 2 11.5C2 12.163 2.26339 12.7989 2.73223 13.2678C3.20107 13.7366 3.83696 14 4.5 14H6M18 9H19.5C20.163 9 20.7989 9.26339 21.2678 9.73223C21.7366 10.2011 22 10.837 22 11.5C22 12.163 21.7366 12.7989 21.2678 13.2678C20.7989 13.7366 20.163 14 19.5 14H18M12 18V22M8 22H16M6 9V6C6 5.46957 6.21071 4.96086 6.58579 4.58579C6.96086 4.21071 7.46957 4 8 4H16C16.5304 4 17.0391 4.21071 17.4142 4.58579C17.7893 4.96086 18 5.46957 18 6V9M6 9C6 12.866 8.68629 16 12 16C15.3137 16 18 12.866 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Award: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.477 12.89L17 22L12 19L7 22L8.523 12.89" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Leaf: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
      <path d="M11 20C11 20 7 16.5 7 12C7 7.5 11 4 11 4C11 4 15 7.5 15 12C15 16.5 11 20 11 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 20C11 20 7 16.5 7 12C7 7.5 11 4 11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 4C11 4 15 7.5 15 12C15 16.5 11 20 11 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 12C20 12 16.5 8 12 8C7.5 8 4 12 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Gem: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
      <path d="M6 3H18L21 8L12 21L3 8L6 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 3L12 21L18 3M3 8H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function AboutPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [user, setUser] = useState<{ name: string; avatar_url: string | null } | null>(null);
  const [reviewForm, setReviewForm] = useState({
    author_name: '',
    author_email: '',
    car_brand: '',
    car_model: '',
    rating: 5,
    text: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const bookBtnRef = useRef<HTMLButtonElement>(null);

  const tabs = ['История', 'Команда', 'Технологии', 'Награды'];
  
  const stats = [
    { value: '10K+', label: 'Довольных клиентов', icon: <Icons.Users /> },
    { value: '5+', label: 'Лет на рынке', icon: <Icons.Star /> },
    { value: '15', label: 'Локаций по городу', icon: <Icons.MapPin /> },
    { value: '50+', label: 'Профессионалов', icon: <Icons.Tool /> }
  ];

  const team = [
    { name: 'Алексей Иванов', role: 'Основатель и CEO', initials: 'АИ', color: '#ff0000' },
    { name: 'Мария Петрова', role: 'Директор по качеству', initials: 'МП', color: '#000000' },
    { name: 'Дмитрий Сидоров', role: 'Главный технолог', initials: 'ДС', color: '#ff0000' },
    { name: 'Елена Козлова', role: 'Менеджер по работе с клиентами', initials: 'ЕК', color: '#000000' }
  ];

  const timeline = [
    { year: '2019', title: 'Основание', desc: 'Открытие первой автомойки' },
    { year: '2020', title: 'Расширение', desc: 'Запуск 5 новых локаций' },
    { year: '2021', title: 'Инновации', desc: 'Внедрение эко-технологий' },
    { year: '2022', title: 'Признание', desc: 'Награда "Лучший сервис года"' },
    { year: '2023', title: 'Рост', desc: '10 000+ постоянных клиентов' },
    { year: '2024', title: 'Будущее', desc: 'Открытие 15 локаций' }
  ];

  const locations = [
    {
      name: 'Центральная',
      address: 'ул. Ленина, 45',
      phone: '+7 (999) 123-45-67',
      hours: '08:00 - 22:00',
      services: ['Мойка', 'Полировка', 'Химчистка'],
      coords: [55.751244, 37.618423] // Москва, центр
    },
    {
      name: 'Северная',
      address: 'пр. Мира, 128',
      phone: '+7 (999) 123-45-68',
      hours: '09:00 - 21:00',
      services: ['Мойка', 'Детейлинг', 'Керамика'],
      coords: [55.781244, 37.618423] // Москва, север
    },
    {
      name: 'Южная',
      address: 'ул. Победы, 89',
      phone: '+7 (999) 123-45-69',
      hours: '08:00 - 23:00',
      services: ['Мойка', 'Полировка', 'Защита'],
      coords: [55.721244, 37.618423] // Москва, юг
    },
  ];

  useEffect(() => {
    setIsLoaded(true);
    
    // Загрузка данных пользователя
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // Автоматически подставляем имя из профиля
          setReviewForm(prev => ({
            ...prev,
            author_name: data.user.name || ''
          }));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    fetchUser();
    
    // Загрузка отзывов из БД
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials?limit=10');
        if (response.ok) {
          const data = await response.json();
          console.log('Loaded testimonials:', data.testimonials);
          setTestimonials(data.testimonials);
        }
      } catch (error) {
        console.error('Error loading testimonials:', error);
      } finally {
        setLoadingTestimonials(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Инициализация Яндекс карты с метками
  useEffect(() => {
    if (!mapRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU';
    script.async = true;
    
    script.onload = () => {
      // @ts-expect-error Yandex Maps API
      window.ymaps.ready(() => {
        // @ts-expect-error Yandex Maps API
        const map = new window.ymaps.Map(mapRef.current, {
          center: [55.751244, 37.618423],
          zoom: 11,
          controls: ['zoomControl', 'fullscreenControl']
        });

        // Добавляем метки для каждой локации
        locations.forEach((location) => {
          // @ts-expect-error Yandex Maps API
          const placemark = new window.ymaps.Placemark(
            location.coords,
            {
              balloonContentHeader: `<div style="font-size: 16px; font-weight: bold; color: #ff0000; margin-bottom: 8px;">${location.name}</div>`,
              balloonContentBody: `
                <div style="font-size: 14px; line-height: 1.6;">
                  <p style="margin: 4px 0;"><strong>📍 Адрес:</strong> ${location.address}</p>
                  <p style="margin: 4px 0;"><strong>📞 Телефон:</strong> ${location.phone}</p>
                  <p style="margin: 4px 0;"><strong>🕐 Часы:</strong> ${location.hours}</p>
                  <p style="margin: 4px 0;"><strong>🚗 Услуги:</strong> ${location.services.join(', ')}</p>
                </div>
              `,
              hintContent: location.name
            },
            {
              preset: 'islands#redAutoIcon',
              iconColor: '#ff0000'
            }
          );
          map.geoObjects.add(placemark);
        });
      });
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Инициализация Яндекс карты
  // Блокировка скролла body при открытии модалки
  useEffect(() => {
    if (showReviewModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showReviewModal]);

  useEffect(() => {
    if (testimonials.length === 0) return;
    
    // Auto-rotate testimonials is handled by CSS animations
    // This effect is kept for potential future use
  }, [testimonials.length]);

  const handleBookMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const fill = button.querySelector(`.${styles.buttonFill}`) as HTMLElement;
    
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

  const handleBookMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const fill = button.querySelector(`.${styles.buttonFill}`) as HTMLElement;
    if (fill) {
      gsap.killTweensOf(fill);
      gsap.to(fill, {
        scale: 0,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      // Добавляем avatar_url из профиля пользователя
      const dataToSend = {
        ...reviewForm,
        avatar_url: user?.avatar_url || null
      };

      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setReviewSuccess(true);
        // Перезагружаем отзывы
        const testimonialsResponse = await fetch('/api/testimonials?limit=10');
        if (testimonialsResponse.ok) {
          const data = await testimonialsResponse.json();
          setTestimonials(data.testimonials);
        }
        // Закрываем модалку через 3 секунды
        setTimeout(() => {
          setShowReviewModal(false);
          setReviewSuccess(false);
          setReviewForm({
            author_name: user?.name || '',
            author_email: '',
            car_brand: '',
            car_model: '',
            rating: 5,
            text: ''
          });
        }, 3000);
      } else {
        alert('Ошибка при отправке отзыва');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Ошибка при отправке отзыва');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <Header />
      <main className={`${styles.page} ${isLoaded ? styles.loaded : ''}`}>
        {/* Hero Section */}
        <section className={styles.hero} ref={heroRef}>
          <div className={styles.heroBackground}>
            <span className={styles.bgText} style={{ top: '10%', left: '5%', rotate: '-15deg' }}>Кристалл</span>
            <span className={styles.bgText} style={{ top: '50%', right: '5%', rotate: '15deg' }}>Авто</span>
            <span className={styles.bgText} style={{ bottom: '10%', left: '10%', rotate: '-10deg' }}>Premium</span>
          </div>
          
          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
              <div className={styles.badge}>О НАС</div>
              <h1 className={styles.heroTitle}>
                Мы создаем<br />
                <span className={styles.highlight}>идеальную</span><br />
                чистоту
              </h1>
              <p className={styles.heroText}>
                Более 5 лет мы предоставляем премиальные услуги по уходу за автомобилями. 
                Наша миссия - сделать каждый автомобиль безупречным.
              </p>
              <button 
                ref={bookBtnRef}
                className={styles.ctaButton}
                onClick={() => router.push('/booking')}
                onMouseEnter={handleBookMouseEnter}
                onMouseLeave={handleBookMouseLeave}
              >
                <span className={styles.buttonFill}></span>
                <span className={styles.buttonText}>Записаться сейчас</span>
              </button>
            </div>
            
            <div className={styles.heroRight}>
              <div className={styles.floatingCard}>
                <div className={styles.cardIcon}>
                  <Icons.Car />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardValue}>100%</div>
                  <div className={styles.cardLabel}>Гарантия качества</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.stats} ref={statsRef}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`${styles.statCard} ${hoveredStat === index ? styles.hovered : ''}`}
                onMouseEnter={() => setHoveredStat(index)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statGlow}></div>
              </div>
            ))}
          </div>
        </section>

        {/* Tabs Section */}
        <section className={styles.tabsSection}>
          <div className={styles.tabsHeader}>
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`${styles.tab} ${activeTab === index ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
                {activeTab === index && <div className={styles.tabIndicator}></div>}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 0 && (
              <div className={styles.historyContent}>
                <div className={styles.timeline}>
                  {timeline.map((item, index) => (
                    <div key={index} className={styles.timelineItem}>
                      <div className={styles.timelineYear}>{item.year}</div>
                      <div className={styles.timelineDot}></div>
                      <div className={styles.timelineContent}>
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className={styles.teamContent}>
                <div className={styles.teamGrid}>
                  {team.map((member, index) => (
                    <div key={index} className={styles.teamCard}>
                      <div className={styles.teamAvatar} style={{ background: member.color }}>
                        <span>{member.initials}</span>
                      </div>
                      <h3>{member.name}</h3>
                      <p>{member.role}</p>
                      <div className={styles.teamSocial}>
                        <button aria-label="LinkedIn">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button aria-label="Email">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button aria-label="Phone">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22 16.92V19.92C22 20.4696 21.7893 20.9968 21.4142 21.3869C21.0391 21.777 20.5304 22 20 22C16.0993 21.763 12.3928 20.1065 9.39 17.27C6.58 14.63 4.63 11.36 3.39 7.78C2.99 6.78 2.79 5.71 2.79 4.63C2.79 3.61 3.19 2.63 3.89 1.89C4.59 1.15 5.54 0.75 6.54 0.75H9.54C10.0896 0.75 10.6168 0.960714 11.007 1.33579C11.3971 1.71086 11.62 2.21957 11.62 2.75C11.62 3.75 11.82 4.73 12.21 5.65C12.39 6.08 12.44 6.55 12.35 7.01C12.26 7.47 12.04 7.89 11.72 8.22L10.72 9.22C12.1 11.77 14.23 13.9 16.78 15.28L17.78 14.28C18.11 13.96 18.53 13.74 18.99 13.65C19.45 13.56 19.92 13.61 20.35 13.79C21.27 14.18 22.25 14.38 23.25 14.38C23.7796 14.38 24.2868 14.5907 24.6619 14.9658C25.037 15.3409 25.25 15.8696 25.25 16.42V19.42C25.25 19.95 25.04 20.46 24.67 20.85C24.3 21.24 23.81 21.5 23.25 21.5C22.83 21.5 22.41 21.42 22 21.27V16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className={styles.techContent}>
                <div className={styles.techGrid}>
                  <div className={styles.techCard}>
                    <div className={styles.techIcon}><Icons.Science /></div>
                    <h3>Нанотехнологии</h3>
                    <p>Используем передовые нанопокрытия для защиты кузова</p>
                  </div>
                  <div className={styles.techCard}>
                    <div className={styles.techIcon}><Icons.Droplet /></div>
                    <h3>Эко-система</h3>
                    <p>Система рециркуляции воды экономит до 80% ресурсов</p>
                  </div>
                  <div className={styles.techCard}>
                    <div className={styles.techIcon}><Icons.Zap /></div>
                    <h3>Быстрая сушка</h3>
                    <p>Инновационная система сушки за 3 минуты</p>
                  </div>
                  <div className={styles.techCard}>
                    <div className={styles.techIcon}><Icons.Cpu /></div>
                    <h3>AI-контроль</h3>
                    <p>Искусственный интеллект контролирует качество</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className={styles.awardsContent}>
                <div className={styles.awardsGrid}>
                  <div className={styles.awardCard}>
                    <div className={styles.awardIcon}><Icons.Trophy /></div>
                    <h3>Лучший сервис 2023</h3>
                    <p>Премия &quot;Автомойка года&quot;</p>
                  </div>
                  <div className={styles.awardCard}>
                    <div className={styles.awardIcon}><Icons.Award /></div>
                    <h3>5 звезд качества</h3>
                    <p>Сертификат ISO 9001</p>
                  </div>
                  <div className={styles.awardCard}>
                    <div className={styles.awardIcon}><Icons.Leaf /></div>
                    <h3>Эко-сертификат</h3>
                    <p>Зеленые технологии</p>
                  </div>
                  <div className={styles.awardCard}>
                    <div className={styles.awardIcon}><Icons.Gem /></div>
                    <h3>Премиум качество</h3>
                    <p>Знак качества 2024</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={styles.testimonials}>
          <div className={styles.testimonialsHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Отзывы клиентов</h2>
              <p className={styles.sectionSubtitle}>Что говорят о нас наши клиенты</p>
            </div>
            <button 
              className={styles.addReviewBtn}
              onClick={() => setShowReviewModal(true)}
              onMouseEnter={handleBookMouseEnter}
              onMouseLeave={handleBookMouseLeave}
            >
              <span className={styles.buttonFill}></span>
              <span className={styles.buttonText} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Оставить отзыв
              </span>
            </button>
          </div>
          
          {loadingTestimonials ? (
            <div className={styles.testimonialsGrid}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={`${styles.reviewCard} ${styles.skeleton}`}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewAvatar}></div>
                    <div className={styles.reviewAuthorInfo}>
                      <div className={styles.skeletonLine} style={{ width: '60%', height: '1.2rem' }}></div>
                      <div className={styles.skeletonLine} style={{ width: '40%', height: '0.9rem', marginTop: '0.5rem' }}></div>
                    </div>
                  </div>
                  <div className={styles.skeletonLine} style={{ width: '100%', height: '0.9rem', marginTop: '1rem' }}></div>
                  <div className={styles.skeletonLine} style={{ width: '90%', height: '0.9rem', marginTop: '0.5rem' }}></div>
                  <div className={styles.skeletonLine} style={{ width: '95%', height: '0.9rem', marginTop: '0.5rem' }}></div>
                </div>
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div className={styles.testimonialsGrid}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewAvatar}>
                      {testimonial.avatar_url ? (
                        <>
                          <Image 
                            src={testimonial.avatar_url} 
                            alt={testimonial.author_name}
                            width={56}
                            height={56}
                            style={{ objectFit: 'cover', borderRadius: '50%' }}
                            onError={(e) => {
                              console.error('Image load error:', testimonial.avatar_url);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.nextSibling) {
                                (target.nextSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                            onLoad={() => console.log('Image loaded:', testimonial.avatar_url)}
                          />
                          <span style={{ 
                            display: 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%'
                          }}>
                            {testimonial.author_name.charAt(0).toUpperCase()}
                          </span>
                        </>
                      ) : (
                        <span style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%'
                        }}>
                          {testimonial.author_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={styles.reviewAuthorInfo}>
                      <div className={styles.reviewAuthorName}>{testimonial.author_name}</div>
                      <div className={styles.reviewAuthorCar}>
                        {testimonial.car_brand && testimonial.car_model
                          ? `${testimonial.car_brand} ${testimonial.car_model}`
                          : 'Клиент автомойки'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill={i < testimonial.rating ? 'currentColor' : 'none'}
                        className={i < testimonial.rating ? styles.starFilled : styles.starEmpty}
                      >
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    ))}
                  </div>
                  
                  <p className={styles.reviewText}>{testimonial.text}</p>
                  
                  <div className={styles.reviewDate}>
                    {new Date(testimonial.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>Пока нет отзывов</h3>
              <p>Станьте первым, кто оставит отзыв о нашем сервисе!</p>
              <button 
                className={styles.emptyStateBtn}
                onClick={() => setShowReviewModal(true)}
                onMouseEnter={handleBookMouseEnter}
                onMouseLeave={handleBookMouseLeave}
              >
                <span className={styles.buttonFill}></span>
                <span className={styles.buttonText}>Оставить первый отзыв</span>
              </button>
            </div>
          )}
        </section>

        {/* Map Section */}
        <section className={styles.mapSection}>
          <h2 className={styles.mapTitle}>Наши локации</h2>
          <p className={styles.mapSubtitle}>Найдите ближайшую к вам автомойку</p>
          <div className={styles.mapContainer}>
            <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '24px' }}></div>
          </div>

          <div className={styles.locationsGrid}>
            {locations.map((location, index) => (
              <div key={index} className={styles.locationCard}>
                <div className={styles.locationIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className={styles.locationName}>{location.name}</h3>
                <div className={styles.locationInfo}>
                  <div className={styles.locationDetail}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{location.address}</span>
                  </div>
                  <div className={styles.locationDetail}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{location.phone}</span>
                  </div>
                  <div className={styles.locationDetail}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>{location.hours}</span>
                  </div>
                </div>
                <div className={styles.locationServices}>
                  {location.services.map((service, idx) => (
                    <span key={idx} className={styles.serviceTag}>{service}</span>
                  ))}
                </div>
                <button 
                  className={styles.locationButton}
                  onClick={() => router.push('/booking')}
                  onMouseEnter={handleBookMouseEnter}
                  onMouseLeave={handleBookMouseLeave}
                >
                  <span className={styles.buttonFill}></span>
                  <span className={styles.buttonText}>Записаться</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div 
          className={styles.modalOverlay} 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReviewModal(false);
              setReviewSuccess(false);
            }
          }}
        >
          <div className={styles.modal}>
            <button 
              className={styles.modalClose}
              onClick={() => {
                setShowReviewModal(false);
                setReviewSuccess(false);
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {reviewSuccess ? (
              <div className={styles.successMessage}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#00ff00" strokeWidth="2"/>
                  <path d="M8 12L11 15L16 9" stroke="#00ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Спасибо за отзыв!</h3>
                <p>Ваш отзыв успешно добавлен и уже отображается на сайте</p>
                <button 
                  className={styles.successBtn}
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewSuccess(false);
                  }}
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <h2 className={styles.modalTitle}>Оставить отзыв</h2>
                <p className={styles.modalSubtitle}>Поделитесь своим опытом с нами</p>

                <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
                  <div className={styles.formGroup}>
                    <label>Ваше имя *</label>
                    <input
                      type="text"
                      value={reviewForm.author_name}
                      onChange={(e) => setReviewForm({...reviewForm, author_name: e.target.value})}
                      placeholder="Иван Иванов"
                      required
                      readOnly={!!user}
                      style={user ? { backgroundColor: 'rgba(255, 255, 255, 0.03)', cursor: 'not-allowed' } : {}}
                    />
                    {user && (
                      <small style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Имя взято из вашего профиля
                      </small>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={reviewForm.author_email}
                      onChange={(e) => setReviewForm({...reviewForm, author_email: e.target.value})}
                      placeholder="ivan@example.com"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Марка авто</label>
                      <input
                        type="text"
                        value={reviewForm.car_brand}
                        onChange={(e) => setReviewForm({...reviewForm, car_brand: e.target.value})}
                        placeholder="BMW"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Модель</label>
                      <input
                        type="text"
                        value={reviewForm.car_model}
                        onChange={(e) => setReviewForm({...reviewForm, car_model: e.target.value})}
                        placeholder="X5"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Оценка *</label>
                    <div className={styles.ratingInput}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`${styles.starBtn} ${star <= reviewForm.rating ? styles.active : ''}`}
                          onClick={() => setReviewForm({...reviewForm, rating: star})}
                        >
                          <svg width="32" height="32" viewBox="0 0 24 24" fill={star <= reviewForm.rating ? 'currentColor' : 'none'}>
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Ваш отзыв *</label>
                    <textarea
                      value={reviewForm.text}
                      onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                      placeholder="Расскажите о вашем опыте..."
                      rows={5}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={submittingReview}
                    onMouseEnter={handleBookMouseEnter}
                    onMouseLeave={handleBookMouseLeave}
                  >
                    <span className={styles.buttonFill}></span>
                    <span className={styles.buttonText}>
                      {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
                    </span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
