'use client';
import styles from "./page.module.css";
import Footer from "./components/Footer/Footer";
import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const button1Ref = useRef<HTMLAnchorElement | null>(null);
  const button2Ref = useRef<HTMLAnchorElement | null>(null);
  const priceBtn1Ref = useRef<HTMLButtonElement | null>(null);
  const priceBtn2Ref = useRef<HTMLButtonElement | null>(null);
  const priceBtn3Ref = useRef<HTMLButtonElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  const slides = [
    {
      badge: "НАШИ ПРЕИМУЩЕСТВА",
      value: "10k+",
      title: "КЛИЕНТОВ",
      description: "Более 10 000 довольных клиентов доверяют нам уход за своими автомобилями. Профессиональный сервис и качество проверенное временем"
    },
    {
      badge: "ОПЫТ РАБОТЫ",
      value: "5+",
      title: "ЛЕТ",
      description: "Пять лет успешной работы на рынке автомоечных услуг. Мы знаем все тонкости ухода за автомобилями любых марок"
    },
    {
      badge: "КАЧЕСТВО",
      value: "100%",
      title: "ГАРАНТИЯ",
      description: "Гарантируем качество выполненных работ. Если результат вас не устроит - переделаем бесплатно"
    },
    {
      badge: "СКОРОСТЬ",
      value: "30",
      title: "МИНУТ",
      description: "Экспресс-мойка всего за 30 минут. Ценим ваше время и работаем быстро без потери качества"
    },
    {
      badge: "ТЕХНОЛОГИИ",
      value: "NEW",
      title: "ОБОРУДОВАНИЕ",
      description: "Используем современное европейское оборудование и премиальную автохимию для идеального результата"
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const dots = document.querySelectorAll(`.${styles.dot}`);
    dots.forEach((dot, index) => {
      if (index === currentSlide) {
        gsap.to(dot, {
          width: 32,
          scale: 1,
          opacity: 1,
          backgroundColor: 'white',
          duration: 0.4,
          ease: "back.out(1.7)"
        });
      } else {
        gsap.to(dot, {
          width: 8,
          scale: 0.8,
          opacity: 0.5,
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
  }, [currentSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = () => {
    if (!isDraggingRef.current) return;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    const endX = e.changedTouches[0].clientX;
    const diff = startXRef.current - endX;

    if (Math.abs(diff) > 30) {
      if (diff > 0 && currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (diff < 0 && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    }

    isDraggingRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    isDraggingRef.current = true;
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const endX = e.clientX;
    const diff = startXRef.current - endX;

    if (Math.abs(diff) > 30) {
      if (diff > 0 && currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (diff < 0 && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    }

    isDraggingRef.current = false;
  };

  const handleMouseEnter = (buttonRef: React.RefObject<HTMLAnchorElement | HTMLButtonElement | null>, e: React.MouseEvent) => {
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

  const handleMouseLeave = (buttonRef: React.RefObject<HTMLAnchorElement | HTMLButtonElement | null>) => {
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

  return (
    <div className={`${styles.page} ${isLoaded ? styles.loaded : ''}`}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <span className={styles.bgText} style={{ top: '10%', left: '3%', rotate: '15deg' }}>Кристалл Авто</span>
            <span className={styles.bgText} style={{ top: '40%', right: '-10%', rotate: '-15deg' }}>Кристалл Авто</span>
            <span className={styles.bgText} style={{ bottom: '5%', left: '-4%', rotate: '15deg' }}>Кристалл Авто</span>
          </div>
          
          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
            <div className={styles.badge}>ПРЕМИУМ СЕРВИС</div>
            <h1 className={styles.heroTitle}>
              Премиальный<br />
              уход за вашим<br />
              <span className={styles.highlight}>автомобилем</span>
            </h1>
            <p className={styles.heroText}>
              Инновационные технологии и профессиональный подход к каждой детали
            </p>
            
            <div className={styles.heroButtons}>
              <a 
                href="/booking" 
                className={styles.ctaButton}
                ref={button1Ref}
                onMouseEnter={(e) => handleMouseEnter(button1Ref, e)}
                onMouseLeave={() => handleMouseLeave(button1Ref)}
              >
                <span className={styles.buttonFill}></span>
                <span className={styles.buttonText}>Записаться онлайн</span>
              </a>
              <a 
                href="/about" 
                className={styles.ctaButton}
                ref={button2Ref}
                onMouseEnter={(e) => handleMouseEnter(button2Ref, e)}
                onMouseLeave={() => handleMouseLeave(button2Ref)}
              > 
                <span className={styles.buttonFill}></span>
                <span className={styles.buttonText}>
                  Прочитайте о нас
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.statCard}>
              <div 
                className={styles.statCardContent}
                ref={sliderRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => { isDraggingRef.current = false; }}
              >
                <div 
                  className={styles.statCardSlider}
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {slides.map((slide, index) => (
                    <div key={index} className={styles.statSlide}>
                      <div className={styles.statBadge}>{slide.badge}</div>
                      <div className={styles.statValue}>{slide.value}</div>
                      <div className={styles.statTitle}>{slide.title}</div>
                      <div className={styles.statDescription}>
                        {slide.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.statDots}>
                {slides.map((_, dotIndex) => (
                  <span 
                    key={dotIndex}
                    className={`${styles.dot} ${dotIndex === currentSlide ? styles.active : ''}`}
                    onClick={() => setCurrentSlide(dotIndex)}
                  ></span>
                ))}
              </div>
            </div>
          </div>
          </div>
        </section>

        <div className={styles.contentWrapper}>
          <section id="services" className={styles.services}>
          <div className={styles.sectionHeader}>
            <h2>Наши услуги</h2>
            <p>Профессиональный уход за вашим автомобилем</p>
          </div>
          <div className={styles.serviceGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <h3>Экспресс-мойка</h3>
                <p>Быстрая и качественная мойка кузова с использованием премиальной химии</p>
                <div className={styles.serviceFooter}>
                  <span className={styles.serviceTime}>30 мин</span>
                  <span className={styles.servicePrice}>от 600₽</span>
                </div>
              </div>
              <div className={styles.serviceAccent}></div>
            </div>
            
            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <h3>Комплексная мойка</h3>
                <p>Полная мойка снаружи и внутри с обработкой всех поверхностей</p>
                <div className={styles.serviceFooter}>
                  <span className={styles.serviceTime}>1.5 часа</span>
                  <span className={styles.servicePrice}>от 1500₽</span>
                </div>
              </div>
              <div className={styles.serviceAccent}></div>
            </div>
            
            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <h3>Химчистка салона</h3>
                <p>Глубокая очистка салона с удалением любых загрязнений и запахов</p>
                <div className={styles.serviceFooter}>
                  <span className={styles.serviceTime}>4-6 часов</span>
                  <span className={styles.servicePrice}>от 3000₽</span>
                </div>
              </div>
              <div className={styles.serviceAccent}></div>
            </div>
            
            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <h3>Полировка кузова</h3>
                <p>Восстановление блеска и защита лакокрасочного покрытия</p>
                <div className={styles.serviceFooter}>
                  <span className={styles.serviceTime}>3-5 часов</span>
                  <span className={styles.servicePrice}>от 5000₽</span>
                </div>
              </div>
              <div className={styles.serviceAccent}></div>
            </div>
            
          </div>
        </section>

        <section id="prices" className={styles.prices}>
          <div className={styles.pricesBackground}>
            <span className={styles.bgTextPrice} style={{ top: '15%', left: '5%', rotate: '-10deg' }}>Premium</span>
            <span className={styles.bgTextPrice} style={{ bottom: '20%', right: '8%', rotate: '10deg' }}>Quality</span>
          </div>
          
          <div className={styles.pricesContent}>
            <div className={styles.sectionHeader}>
              <h2>Тарифы и цены</h2>
              <p>Прозрачная система ценообразования без скрытых платежей</p>
            </div>
            
            <div className={styles.priceCards}>
              <div className={styles.priceCard}>
                <div className={styles.priceCardHeader}>
                  <h3>Стандарт</h3>
                  <div className={styles.priceTag}>
                    <span className={styles.priceAmount}>600₽</span>
                    <span className={styles.pricePeriod}>за мойку</span>
                  </div>
                </div>
                <ul className={styles.priceFeatures}>
                  <li>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Мойка кузова
                  </li>
                  <li>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Чистка колес
                  </li>
                  <li>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Сушка
                  </li>
                </ul>
                <button 
                  ref={priceBtn1Ref}
                  onClick={() => router.push('/booking')} 
                  className={styles.priceBtn}
                  onMouseEnter={(e) => handleMouseEnter(priceBtn1Ref, e)}
                  onMouseLeave={() => handleMouseLeave(priceBtn1Ref)}
                >
                  <span className={styles.buttonFill}></span>
                  <span className={styles.buttonText}>Выбрать тариф</span>
                </button>
              </div>

              <div className={`${styles.priceCard} ${styles.featured}`}>
                <div className={styles.featuredLabel}>Популярный</div>
                <div className={styles.priceCardHeader}>
                  <h3>Премиум</h3>
                  <div className={styles.priceTag}>
                    <span className={styles.priceAmount}>1500₽</span>
                    <span className={styles.pricePeriod}>за мойку</span>
                  </div>
                </div>
                <ul className={styles.priceFeatures}>
                  <li>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Комплексная мойка
                  </li>
                  <li>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Химчистка салона
                  </li>
                  <li>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Полировка кузова
                  </li>
                  <li>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Чернение шин
                  </li>
                </ul>
                <button 
                  ref={priceBtn2Ref}
                  onClick={() => router.push('/booking')} 
                  className={styles.priceBtn}
                  onMouseEnter={(e) => handleMouseEnter(priceBtn2Ref, e)}
                  onMouseLeave={() => handleMouseLeave(priceBtn2Ref)}
                >
                  <span className={styles.buttonFill}></span>
                  <span className={styles.buttonText}>Выбрать тариф</span>
                </button>
              </div>

              <div className={styles.priceCard}>
                <div className={styles.priceCardHeader}>
                  <h3>VIP</h3>
                  <div className={styles.priceTag}>
                    <span className={styles.priceAmount}>3000₽</span>
                    <span className={styles.pricePeriod}>за мойку</span>
                  </div>
                </div>
                <ul className={styles.priceFeatures}>
                  <li>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Детейлинг
                  </li>
                  <li>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Нанокерамика
                  </li>
                  <li>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Защитное покрытие
                  </li>
                  <li>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Озонирование
                  </li>
                </ul>
                <button 
                  ref={priceBtn3Ref}
                  onClick={() => router.push('/booking')} 
                  className={styles.priceBtn}
                  onMouseEnter={(e) => handleMouseEnter(priceBtn3Ref, e)}
                  onMouseLeave={() => handleMouseLeave(priceBtn3Ref)}
                >
                  <span className={styles.buttonFill}></span>
                  <span className={styles.buttonText}>Выбрать тариф</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.sectionHeader}>
            <h2>Почему выбирают нас</h2>
            <p>Преимущества работы с нами</p>
          </div>
          
          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <div className={styles.featureLeft}>
                <div className={styles.featureIconBox}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className={styles.featureRight}>
                <h3>Гарантия качества</h3>
                <p>100% удовлетворение результатом или бесплатная повторная мойка. Мы уверены в качестве наших услуг</p>
              </div>
              <div className={styles.featureLine}></div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureLeft}>
                <div className={styles.featureIconBox}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className={styles.featureRight}>
                <h3>Быстрый сервис</h3>
                <p>Экспресс-мойка всего за 30 минут. Ценим ваше время и работаем максимально эффективно</p>
              </div>
              <div className={styles.featureLine}></div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureLeft}>
                <div className={styles.featureIconBox}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className={styles.featureRight}>
                <h3>Современное оборудование</h3>
                <p>Используем передовые технологии и премиальную автохимию для идеального результата</p>
              </div>
              <div className={styles.featureLine}></div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureLeft}>
                <div className={styles.featureIconBox}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className={styles.featureRight}>
                <h3>Довольные клиенты</h3>
                <p>Более 10 000 положительных отзывов от наших постоянных клиентов по всей России</p>
              </div>
              <div className={styles.featureLine}></div>
            </div>
          </div>
        </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
