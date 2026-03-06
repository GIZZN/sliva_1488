// App constants
export const APP_NAME = 'Кристалл Авто';
export const APP_DESCRIPTION = 'Премиальный уход за вашим автомобилем';

// Routes
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  BOOKING: '/booking',
  CONTACTS: '/contacts',
  PROFILE: '/profile',
  AUTH: '/auth',
  TERMS: '/terms',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  USERS: {
    SYNC: '/api/users/sync',
  },
  WEBHOOKS: {
    CLERK: '/api/webhooks/clerk',
  },
} as const;

// Services
export const SERVICES = [
  {
    id: 1,
    title: 'Экспресс-мойка',
    description: 'Быстрая и качественная мойка кузова с использованием премиальной химии',
    time: '30 мин',
    price: 'от 600₽',
  },
  {
    id: 2,
    title: 'Комплексная мойка',
    description: 'Полная мойка снаружи и внутри с обработкой всех поверхностей',
    time: '1.5 часа',
    price: 'от 1500₽',
  },
  {
    id: 3,
    title: 'Химчистка салона',
    description: 'Глубокая очистка салона с удалением любых загрязнений и запахов',
    time: '4-6 часов',
    price: 'от 3000₽',
  },
  {
    id: 4,
    title: 'Полировка кузова',
    description: 'Восстановление блеска и защита лакокрасочного покрытия',
    time: '3-5 часов',
    price: 'от 5000₽',
  },
] as const;

// Pricing tiers
export const PRICING_TIERS = [
  {
    id: 'standard',
    name: 'Стандарт',
    price: 600,
    period: 'за мойку',
    features: ['Мойка кузова', 'Чистка колес', 'Сушка'],
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 1500,
    period: 'за мойку',
    featured: true,
    features: ['Комплексная мойка', 'Химчистка салона', 'Полировка кузова', 'Чернение шин'],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 3000,
    period: 'за мойку',
    features: ['Детейлинг', 'Нанокерамика', 'Защитное покрытие', 'Озонирование'],
  },
] as const;

// Features
export const FEATURES = [
  {
    id: 1,
    title: 'Гарантия качества',
    description: '100% удовлетворение результатом или бесплатная повторная мойка. Мы уверены в качестве наших услуг',
    icon: 'check',
  },
  {
    id: 2,
    title: 'Быстрый сервис',
    description: 'Экспресс-мойка всего за 30 минут. Ценим ваше время и работаем максимально эффективно',
    icon: 'clock',
  },
  {
    id: 3,
    title: 'Современное оборудование',
    description: 'Используем передовые технологии и премиальную автохимию для идеального результата',
    icon: 'lightning',
  },
  {
    id: 4,
    title: 'Довольные клиенты',
    description: 'Более 10 000 положительных отзывов от наших постоянных клиентов по всей России',
    icon: 'smile',
  },
] as const;
