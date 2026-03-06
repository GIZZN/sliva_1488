'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { IoFlashSharp, IoSparkles, IoStar } from 'react-icons/io5';
import { FaCrown } from 'react-icons/fa';
import styles from './booking.module.css';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  is_active?: boolean;
  features?: string[];
  icon?: React.ReactNode;
  popular?: boolean;
  rating?: number;
  reviewCount?: number;
}

interface ServiceExtra {
  id: number;
  name: string;
  price: number;
  duration: number;
}

interface Location {
  id: number;
  name: string;
  address: string;
  workingHours: string;
}

interface Booking {
  id: number;
  service_name: string;
  service_price: number;
  booking_date: string;
  booking_time: string;
  car_model: string;
  car_number: string;
  status: string;
  created_at: string;
}

const SERVICES: Service[] = [
  {
    id: 1,
    name: 'Экспресс-мойка',
    description: 'Быстрая и качественная мойка кузова',
    price: 600,
    duration: 30,
    icon: <IoFlashSharp size={64} />,
    rating: 4.7,
    reviewCount: 342,
    features: ['Мойка кузова', 'Чистка колес', 'Сушка', 'Чернение шин']
  },
  {
    id: 2,
    name: 'Комплексная мойка',
    description: 'Полная мойка снаружи и внутри',
    price: 1500,
    duration: 90,
    icon: <IoSparkles size={64} />,
    popular: true,
    rating: 4.9,
    reviewCount: 567,
    features: ['Мойка кузова', 'Химчистка салона', 'Полировка кузова', 'Чернение шин', 'Чистка багажника']
  },
  {
    id: 3,
    name: 'VIP детейлинг',
    description: 'Премиальный уход за автомобилем',
    price: 3000,
    duration: 180,
    icon: <FaCrown size={64} />,
    rating: 5.0,
    reviewCount: 189,
    features: ['Детейлинг кузова', 'Нанокерамика', 'Защитное покрытие', 'Озонирование', 'Полировка фар', 'Химчистка премиум']
  }
];

const SERVICE_EXTRAS: ServiceExtra[] = [
  { id: 1, name: 'Чистка ковриков', price: 200, duration: 15 },
  { id: 2, name: 'Полировка фар', price: 500, duration: 30 },
  { id: 3, name: 'Озонирование салона', price: 800, duration: 45 },
  { id: 4, name: 'Чернение пластика', price: 300, duration: 20 },
  { id: 5, name: 'Защита кузова воском', price: 1000, duration: 40 }
];

const LOCATIONS: Location[] = [
  { id: 1, name: 'Центральная', address: 'ул. Ленина, 45', workingHours: '08:00 - 22:00' },
  { id: 2, name: 'Северная', address: 'пр. Мира, 128', workingHours: '09:00 - 21:00' },
  { id: 3, name: 'Южная', address: 'ул. Победы, 89', workingHours: '08:00 - 23:00' },
];

// Иконки для услуг по умолчанию
const getServiceIcon = (serviceName: string) => {
  if (serviceName.toLowerCase().includes('экспресс')) {
    return <IoFlashSharp size={64} />;
  } else if (serviceName.toLowerCase().includes('vip') || serviceName.toLowerCase().includes('детейлинг')) {
    return <FaCrown size={64} />;
  } else {
    return <IoSparkles size={64} />;
  }
};

// Фичи по умолчанию для услуг
const getServiceFeatures = (serviceName: string): string[] => {
  if (serviceName.toLowerCase().includes('экспресс')) {
    return ['Мойка кузова', 'Чистка колес', 'Сушка', 'Чернение шин'];
  } else if (serviceName.toLowerCase().includes('vip') || serviceName.toLowerCase().includes('детейлинг')) {
    return ['Детейлинг кузова', 'Нанокерамика', 'Защитное покрытие', 'Озонирование', 'Полировка фар', 'Химчистка премиум'];
  } else {
    return ['Мойка кузова', 'Химчистка салона', 'Полировка кузова', 'Чернение шин', 'Чистка багажника'];
  }
};

export default function BookingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  
  // Ref для кнопки и секции записей
  const button1Ref = useRef<HTMLButtonElement | null>(null);
  const myBookingsSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsLoaded(true);
    fetchUser();
    fetchBookings();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        // Добавляем иконки и фичи к загруженным услугам
        const servicesWithExtras = data.services.map((service: Service, index: number) => ({
          ...service,
          icon: getServiceIcon(service.name),
          features: getServiceFeatures(service.name),
          popular: index === 1, // Средняя услуга помечается как популярная
          rating: 4.5 + (index * 0.2),
          reviewCount: 200 + (index * 100)
        }));
        setServices(servicesWithExtras);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setMyBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Анимация кнопок
  const handleMouseEnter = (buttonRef: React.RefObject<HTMLButtonElement | null>, e: React.MouseEvent) => {
    if (buttonRef.current) {
      const fill = buttonRef.current.querySelector(`.${styles.buttonFill}`);
      if (fill) {
        const rect = buttonRef.current.getBoundingClientRect();
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
    }
  };

  const handleMouseLeave = (buttonRef: React.RefObject<HTMLButtonElement | null>) => {
    if (buttonRef.current) {
      const fill = buttonRef.current.querySelector(`.${styles.buttonFill}`);
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

  const handleMyBookingsClick = () => {
    setShowMyBookings(!showMyBookings);
    
    // Скролл к секции "Мои записи" с отступом сверху
    setTimeout(() => {
      if (myBookingsSectionRef.current) {
        const element = myBookingsSectionRef.current;
        const offset = 100; // Отступ сверху в пикселях
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const isSlotAvailable = () => {
    // All slots are available - booking validation happens on server
    return true;
  };

  const toggleExtra = (extraId: number) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const calculateTotalPrice = () => {
    const service = SERVICES.find(s => s.id === selectedService);
    if (!service) return 0;
    
    const extrasPrice = selectedExtras.reduce((sum, extraId) => {
      const extra = SERVICE_EXTRAS.find(e => e.id === extraId);
      return sum + (extra?.price || 0);
    }, 0);
    
    return service.price + extrasPrice;
  };

  const calculateTotalDuration = () => {
    const service = SERVICES.find(s => s.id === selectedService);
    if (!service) return 0;
    
    const extrasDuration = selectedExtras.reduce((sum, extraId) => {
      const extra = SERVICE_EXTRAS.find(e => e.id === extraId);
      return sum + (extra?.duration || 0);
    }, 0);
    
    return service.duration + extrasDuration;
  };

  const getEstimatedCompletionTime = () => {
    if (!bookingTime) return '';
    const [hours, minutes] = bookingTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + calculateTotalDuration();
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleRebook = (booking: Booking) => {
    const service = SERVICES.find(s => s.name === booking.service_name);
    if (service) {
      setSelectedService(service.id);
      setCarModel(booking.car_model);
      setCarNumber(booking.car_number);
      setCurrentStep(2);
      setShowMyBookings(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? myBookings 
    : myBookings.filter(b => b.status === filterStatus);

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
    setTimeout(() => setCurrentStep(2), 300);
  };

  const handleLocationSelect = (locationId: number) => {
    setSelectedLocation(locationId);
    setTimeout(() => setCurrentStep(3), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Пожалуйста, войдите в систему');
      return;
    }

    setIsSubmitting(true);

    try {
      const service = SERVICES.find(s => s.id === selectedService);
      if (!service) return;

      const location = LOCATIONS.find(l => l.id === selectedLocation);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price,
          bookingDate,
          bookingTime,
          carModel,
          carNumber,
          notes: `Локация: ${location?.name}. ${notes}`
        })
      });

      if (response.ok) {
        setShowSuccess(true);
        setCurrentStep(1);
        setSelectedService(null);
        setSelectedLocation(null);
        setBookingDate('');
        setBookingTime('');
        setCarModel('');
        setCarNumber('');
        setNotes('');
        fetchBookings();
        
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка при создании записи');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Ошибка при создании записи');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Вы уверены, что хотите отменить запись?')) return;

    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchBookings();
      } else {
        alert('Ошибка при отмене записи');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Ошибка при отмене записи');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusText = (status: string) => {
    const statuses: Record<string, string> = {
      pending: 'Ожидает',
      confirmed: 'Подтверждено',
      completed: 'Завершено',
      cancelled: 'Отменено'
    };
    return statuses[status] || status;
  };

  const selectedServiceData = SERVICES.find(s => s.id === selectedService);
  const selectedLocationData = LOCATIONS.find(l => l.id === selectedLocation);

  return (
    <>
      <Header />
      <main className={`${styles.page} ${isLoaded ? styles.loaded : ''}`}>
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <span className={styles.bgText} style={{ top: '10%', left: '5%', rotate: '-15deg' }}>Запись</span>
            <span className={styles.bgText} style={{ top: '50%', right: '5%', rotate: '15deg' }}>Онлайн</span>
            <span className={styles.bgText} style={{ bottom: '10%', left: '10%', rotate: '-10deg' }}>24/7</span>
          </div>
          
          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
              <div className={styles.badge}>ОНЛАЙН ЗАПИСЬ</div>
              <h1 className={styles.heroTitle}>
                Запишитесь<br />
                <span className={styles.highlight}>за 3 шага</span>
              </h1>
              <p className={styles.heroText}>
                Выберите услугу, локацию и время - мы позаботимся о вашем автомобиле
              </p>
              
              <div className={styles.heroButtons}>
                <button 
                  className={styles.ctaButton}
                  ref={button1Ref}
                  onMouseEnter={(e) => handleMouseEnter(button1Ref, e)}
                  onMouseLeave={() => handleMouseLeave(button1Ref)}
                  onClick={handleMyBookingsClick}
                >
                  <span className={styles.buttonFill}></span>
                  <span className={styles.buttonText}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Мои записи
                  </span>
                </button>
              </div>
            </div>
            
            <div className={styles.heroRight}>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{myBookings.length}</div>
                  <div className={styles.statLabel}>Ваших записей</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>3</div>
                  <div className={styles.statLabel}>Простых шага</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>24/7</div>
                  <div className={styles.statLabel}>Поддержка</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>1098</div>
                  <div className={styles.statLabel}>Довольных клиентов</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.bookingSection}>
          <div className={styles.container}>
            {/* Progress Steps */}
            <div className={styles.progressSteps}>
              <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''} ${currentStep > 1 ? styles.completed : ''}`}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepLabel}>Услуга</div>
              </div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''} ${currentStep > 2 ? styles.completed : ''}`}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepLabel}>Локация</div>
              </div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepLabel}>Детали</div>
              </div>
            </div>

            {showSuccess && (
              <div className={styles.successMessage}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.8 2 19.1 4.1 20.9 7.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Запись успешно создана!</h3>
                <p>Мы свяжемся с вами для подтверждения</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.bookingForm}>
              {/* Step 1: Service Selection */}
              {currentStep === 1 && (
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <h2 className={styles.stepTitle}>Выберите услугу</h2>
                    <button 
                      type="button"
                      className={styles.compareBtn}
                      onClick={() => setShowComparison(!showComparison)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H9M9 5V21M9 5H15M9 21H15M15 5H17C18.1046 5 19 5.89543 19 7V19C19 20.1046 18.1046 21 17 21H15M15 5V21" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      {showComparison ? 'Скрыть сравнение' : 'Сравнить услуги'}
                    </button>
                  </div>

                  {showComparison && (
                    <div className={styles.comparisonTable}>
                      <div className={styles.comparisonHeader}>
                        <div className={styles.comparisonCell}>Параметр</div>
                        {services.map(service => (
                          <div key={service.id} className={styles.comparisonCell}>
                            <div className={styles.comparisonIcon}>{service.icon}</div>
                            <div className={styles.comparisonName}>{service.name}</div>
                          </div>
                        ))}
                      </div>
                      <div className={styles.comparisonRow}>
                        <div className={styles.comparisonCell}>Цена</div>
                        {services.map(service => (
                          <div key={service.id} className={styles.comparisonCell}>{service.price}₽</div>
                        ))}
                      </div>
                      <div className={styles.comparisonRow}>
                        <div className={styles.comparisonCell}>Длительность</div>
                        {services.map(service => (
                          <div key={service.id} className={styles.comparisonCell}>{service.duration} мин</div>
                        ))}
                      </div>
                      <div className={styles.comparisonRow}>
                        <div className={styles.comparisonCell}>Рейтинг</div>
                        {services.map(service => (
                          <div key={service.id} className={styles.comparisonCell}>
                            <IoStar style={{ color: '#ffd700' }} /> {service.rating} ({service.reviewCount})
                          </div>
                        ))}
                      </div>
                      <div className={styles.comparisonRow}>
                        <div className={styles.comparisonCell}>Услуги</div>
                        {services.map(service => (
                          <div key={service.id} className={styles.comparisonCell}>
                            {service.features?.length || 0} услуг
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.servicesGrid}>
                    {isLoadingServices ? (
                      <div className={styles.loading}>Загрузка услуг...</div>
                    ) : services.length === 0 ? (
                      <div className={styles.emptyState}>Нет доступных услуг</div>
                    ) : (
                      services.map(service => (
                        <div
                          key={service.id}
                          className={`${styles.serviceCard} ${selectedService === service.id ? styles.selected : ''}`}
                          onClick={() => handleServiceSelect(service.id)}
                        >
                          {service.popular && <div className={styles.popularBadge}>Популярно</div>}
                          <div className={styles.serviceIcon}>{service.icon}</div>
                          <div className={styles.serviceRating}>
                            <span className={styles.ratingStars}>
                              <IoStar /> {service.rating}
                            </span>
                            <span className={styles.ratingCount}>({service.reviewCount} отзывов)</span>
                          </div>
                          <h3>{service.name}</h3>
                          <p className={styles.serviceDesc}>{service.description}</p>
                          <ul className={styles.featuresList}>
                            {service.features?.map((feature, idx) => (
                              <li key={idx}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <div className={styles.serviceFooter}>
                          <div className={styles.priceBlock}>
                            <span className={styles.price}>{service.price}₽</span>
                            <span className={styles.duration}>{service.duration} мин</span>
                          </div>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Location Selection */}
              {currentStep === 2 && (
                <div className={styles.stepContent}>
                  <button type="button" className={styles.backBtn} onClick={() => setCurrentStep(1)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Назад
                  </button>
                  
                  <div className={styles.selectedServiceSummary}>
                    <div className={styles.summaryIcon}>{selectedServiceData?.icon}</div>
                    <div>
                      <div className={styles.summaryName}>{selectedServiceData?.name}</div>
                      <div className={styles.summaryPrice}>{selectedServiceData?.price}₽ • {selectedServiceData?.duration} мин</div>
                    </div>
                  </div>

                  <h2 className={styles.stepTitle}>Выберите локацию</h2>
                  <div className={styles.locationsGrid}>
                    {LOCATIONS.map(location => (
                      <div
                        key={location.id}
                        className={`${styles.locationCard} ${selectedLocation === location.id ? styles.selected : ''}`}
                        onClick={() => handleLocationSelect(location.id)}
                      >
                        <div className={styles.locationIcon}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <h3>{location.name}</h3>
                        <p className={styles.locationAddress}>{location.address}</p>
                        <p className={styles.locationHours}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          {location.workingHours}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {currentStep === 3 && (
                <div className={styles.stepContent}>
                  <button type="button" className={styles.backBtn} onClick={() => setCurrentStep(2)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Назад
                  </button>

                  <div className={styles.bookingSummary}>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Услуга:</span>
                      <span className={styles.summaryValue}>{selectedServiceData?.name}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Локация:</span>
                      <span className={styles.summaryValue}>{selectedLocationData?.name}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Базовая стоимость:</span>
                      <span className={styles.summaryValue}>{selectedServiceData?.price}₽</span>
                    </div>
                    {selectedExtras.length > 0 && (
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Доп. услуги:</span>
                        <span className={styles.summaryValue}>
                          +{selectedExtras.reduce((sum, id) => {
                            const extra = SERVICE_EXTRAS.find(e => e.id === id);
                            return sum + (extra?.price || 0);
                          }, 0)}₽
                        </span>
                      </div>
                    )}
                    <div className={`${styles.summaryItem} ${styles.totalItem}`}>
                      <span className={styles.summaryLabel}>Итого:</span>
                      <span className={styles.summaryValue}>{calculateTotalPrice()}₽</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Длительность:</span>
                      <span className={styles.summaryValue}>{calculateTotalDuration()} мин</span>
                    </div>
                    {bookingTime && (
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Завершение:</span>
                        <span className={styles.summaryValue}>~{getEstimatedCompletionTime()}</span>
                      </div>
                    )}
                  </div>

                  <h2 className={styles.stepTitle}>Дополнительные услуги</h2>
                  <div className={styles.extrasGrid}>
                    {SERVICE_EXTRAS.map(extra => (
                      <div
                        key={extra.id}
                        className={`${styles.extraCard} ${selectedExtras.includes(extra.id) ? styles.selected : ''}`}
                        onClick={() => toggleExtra(extra.id)}
                      >
                        <div className={styles.extraCheckbox}>
                          {selectedExtras.includes(extra.id) && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className={styles.extraInfo}>
                          <div className={styles.extraName}>{extra.name}</div>
                          <div className={styles.extraDetails}>
                            <span className={styles.extraPrice}>+{extra.price}₽</span>
                            <span className={styles.extraDuration}>+{extra.duration} мин</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h2 className={styles.stepTitle}>Детали записи</h2>
                  
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Дата</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Время</label>
                      <div className={styles.timeSlotsGrid}>
                        {generateTimeSlots().map(time => {
                          const available = isSlotAvailable();
                          return (
                            <button
                              key={time}
                              type="button"
                              className={`${styles.timeSlot} ${bookingTime === time ? styles.selected : ''} ${!available ? styles.unavailable : ''}`}
                              onClick={() => available && setBookingTime(time)}
                              disabled={!available}
                            >
                              {time}
                              {!available && <span className={styles.unavailableLabel}>Занято</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Модель автомобиля</label>
                      <input
                        type="text"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        placeholder="Toyota Camry"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Номер автомобиля</label>
                      <input
                        type="text"
                        value={carNumber}
                        onChange={(e) => setCarNumber(e.target.value)}
                        placeholder="А123БВ777"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Дополнительные пожелания (необязательно)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Укажите особые пожелания..."
                      rows={3}
                    />
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? 'Отправка...' : 'Подтвердить запись'}
                  </button>
                </div>
              )}
            </form>

            {/* My Bookings */}
            {user && showMyBookings && (
              <div className={styles.myBookingsSection} ref={myBookingsSectionRef}>
                <div className={styles.bookingsHeader}>
                  <h2>Мои записи</h2>
                  <div className={styles.filterButtons}>
                    <button 
                      className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.active : ''}`}
                      onClick={() => setFilterStatus('all')}
                    >
                      Все
                    </button>
                    <button 
                      className={`${styles.filterBtn} ${filterStatus === 'pending' ? styles.active : ''}`}
                      onClick={() => setFilterStatus('pending')}
                    >
                      Ожидает
                    </button>
                    <button 
                      className={`${styles.filterBtn} ${filterStatus === 'confirmed' ? styles.active : ''}`}
                      onClick={() => setFilterStatus('confirmed')}
                    >
                      Подтверждено
                    </button>
                    <button 
                      className={`${styles.filterBtn} ${filterStatus === 'completed' ? styles.active : ''}`}
                      onClick={() => setFilterStatus('completed')}
                    >
                      Завершено
                    </button>
                  </div>
                </div>
                {loadingBookings ? (
                  <p className={styles.loadingText}>Загрузка...</p>
                ) : filteredBookings.length === 0 ? (
                  <div className={styles.emptyState}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <p>{filterStatus === 'all' ? 'У вас пока нет записей' : `Нет записей со статусом "${getStatusText(filterStatus)}"`}</p>
                  </div>
                ) : (
                  <div className={styles.bookingsList}>
                    {filteredBookings.map(booking => (
                      <div key={booking.id} className={styles.bookingCard}>
                        <div className={styles.bookingHeader}>
                          <h3>{booking.service_name}</h3>
                          <span className={`${styles.statusBadge} ${styles[booking.status]}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                        <div className={styles.bookingDetails}>
                          <div className={styles.detailRow}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{formatDate(booking.booking_date)} в {booking.booking_time}</span>
                          </div>
                          <div className={styles.detailRow}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M5 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V11L4.48 5.212C4.63893 4.85144 4.90337 4.54744 5.23995 4.34067C5.57654 4.1339 5.96911 4.03404 6.367 4.053L17.633 4.053C18.0309 4.03404 18.4235 4.1339 18.76 4.34067C19.0966 4.54744 19.3611 4.85144 19.52 5.212L22 11V15C22 15.5304 21.7893 16.0391 21.4142 16.4142C21.0391 16.7893 20.5304 17 20 17H19" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{booking.car_model} ({booking.car_number})</span>
                          </div>
                          <div className={styles.detailRow}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span>{booking.service_price}₽</span>
                          </div>
                        </div>
                        <div className={styles.bookingActions}>
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className={styles.cancelBtn}
                            >
                              Отменить запись
                            </button>
                          )}
                          {(booking.status === 'completed' || booking.status === 'cancelled') && (
                            <button
                              onClick={() => handleRebook(booking)}
                              className={styles.rebookBtn}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Повторить запись
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
