'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from './contacts.module.css';

const Icons = {
  Location: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Phone: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Email: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Clock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

export default function ContactsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        alert('Ошибка при отправке сообщения. Попробуйте позже.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Ошибка при отправке сообщения. Попробуйте позже.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Header />
      <main className={`${styles.page} ${isLoaded ? styles.loaded : ''}`}>
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <span className={styles.bgText} style={{ top: '10%', left: '5%', rotate: '-15deg' }}>Контакты</span>
            <span className={styles.bgText} style={{ top: '50%', right: '5%', rotate: '15deg' }}>Связь</span>
            <span className={styles.bgText} style={{ bottom: '10%', left: '10%', rotate: '-10deg' }}>24/7</span>
          </div>
          
          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
              <div className={styles.badge}>СВЯЖИТЕСЬ С НАМИ</div>
              <h1 className={styles.heroTitle}>
                Мы всегда<br />
                <span className={styles.highlight}>на связи</span>
              </h1>
              <p className={styles.heroText}>
                Свяжитесь с нами любым удобным способом. Наша команда готова ответить на все ваши вопросы.
              </p>
            </div>
            
            <div className={styles.heroRight}>
              <div className={styles.floatingCard}>
                <div className={styles.cardIcon}>
                  <Icons.Phone />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardValue}>24/7</div>
                  <div className={styles.cardLabel}>Поддержка клиентов</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.contactsSection}>
          <div className={styles.contactsGrid}>
            <div className={styles.contactInfo}>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <Icons.Location />
                </div>
                <h3>Адрес</h3>
                <p>г. Москва, ул. Тверская, 15</p>
              </div>
              
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <Icons.Phone />
                </div>
                <h3>Телефон</h3>
                <p>+7 (999) 123-45-67</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <Icons.Email />
                </div>
                <h3>Email</h3>
                <p>info@kristallavto.ru</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <Icons.Clock />
                </div>
                <h3>Режим работы</h3>
                <p>Ежедневно с 8:00 до 22:00</p>
              </div>
            </div>

            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <h2>Напишите нам</h2>
              <p className={styles.formDescription}>
                Заполните форму и мы свяжемся с вами в ближайшее время
              </p>
              
              <div className={styles.formGroup}>
                <label>Ваше имя</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="ivan@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Телефон</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+7 (999) 123-45-67"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Сообщение</label>
                <textarea
                  name="message"
                  placeholder="Расскажите, чем мы можем вам помочь..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <button type="submit" className={styles.submitButton}>
                <span>Отправить сообщение</span>
                <Icons.Send />
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 