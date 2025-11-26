import { Suspense, useEffect, useState, useMemo, useCallback, memo, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei'
import './App.css'

const CONTACT = {
  telegramUrl: 'https://t.me/arhi_pov',
  telegramHandle: '@arhi_pov',
  email: 'daniil.arhipov.2005@gmail.com'
}

const heroStats = [
  { label: 'Премиальные релизы', value: '48+ проектов', detail: 'лендинги · сервисы · AI' },
  { label: 'Средний ROI', value: 'x3.4', detail: 'конверсия · LTV · повторные продажи' },
  { label: 'Time-to-market', value: '3–5 недель', detail: 'vision → production' },
  { label: 'Уровень сервиса', value: 'NPS 9.6', detail: 'SLA 99.9% · white-glove' }
]

const signatureHighlights = [
  {
    title: 'Сценография интерфейсов',
    description:
      'Создаю визуальные истории с мягким светом, volumetric glow, 3D-блобами и подвижной типографикой.',
    metric: 'Art direction · Motion · Micro-interactions'
  },
  {
    title: 'Product leadership',
    description:
      'Веду продукт от гипотезы до релиза: стратегия, UX, аналитика, SLA, roadmap в Notion/Jira, прозрачные KPI.',
    metric: 'Vision · Roadmap · SLA · KPI'
  },
  {
    title: 'AI-native engineering',
    description:
      'Связываю Tilda, React/SvelteKit, Django/FastAPI, Kotlin и AI-стек в единый pipeline с DevOps и observability.',
    metric: 'Tilda · React · Svelte · Django · Telegram · GA4'
  }
]

const services = [
  {
    title: 'Signature лендинги и спецпроекты',
    description:
      'Создаю digital-витрины с depth lighting, кастомным WebGL, zero-block логикой и скоростью загрузки 90+.',
    bullets: [
      'Hero-сцены с 3D и motion-дирекцией',
      'Core Web Vitals 90+ / SEO-ready',
      'CRM, оплаты, мультиязычность, аналитика'
    ]
  },
  {
    title: 'Product engineering / SaaS',
    description:
      'SvelteKit/React фронтенд и Django/FastAPI backend. Личные кабинеты, CRM, маркетплейсы, BI-интерфейсы.',
    bullets: ['Модульная архитектура и дизайн-системы', 'CI/CD, observability, ролевая модель', 'Postgres, Redis, cloud']
  },
  {
    title: 'AI · Telegram · RAG',
    description:
      'AI-ассистенты с RAG, мультиязычной модерацией, платежами и аналитикой внутри Telegram, Web или приложений.',
    bullets: ['OpenAI, Claude, Llama, векторные БД', 'Guardrails, контекст, обучение', 'Оплаты, роли, админки']
  },
  {
    title: 'Mobile & field apps',
    description:
      'Jetpack Compose и SwiftUI MVP/enterprise приложения с офлайн режимами, BLE, GPS и интеграцией с ERP.',
    bullets: ['Native design system и UX-паттерны', 'CI, релизы в сторах, crash-free 99%', 'Мониторинг и поддержка']
  },
  {
    title: 'Data · SEO · Growth',
    description:
      'Настраиваю data-layer, GA4/BigQuery, строю финансовые модели, отчёты и стратегию органики с четкими KPI.',
    bullets: ['Техаудит, скорость, структура', 'End-to-end аналитика и BI', 'Power Query, Python, Looker Studio']
  },
  {
    title: 'Infrastructure & DevOps',
    description:
      'Оркеструю ERP/CRM, собираю ETL, автоматизирую деплой, безопасность, логирование и алерты по SLA.',
    bullets: ['API orchestration и интеграции', 'Docker, Kubernetes, Terraform', 'Observability, on-call, runbooks']
  }
]

const buildMediaSet = (baseUrl, altText) => ({
  alt: altText,
  avif: `${baseUrl}?auto=format&fit=crop&w=1400&q=80&fm=avif`,
  webp: `${baseUrl}?auto=format&fit=crop&w=1400&q=80&fm=webp`,
  fallback: `${baseUrl}?auto=format&fit=crop&w=1400&q=80&fm=jpg`
})

const portfolio = [
  {
    title: 'Digital retail · Tilda',
    description: 'Флагманский лендинг с volumetric hero, WebGL-сценой и динамическим каталогом SKU.',
    result: '+42% к конверсии за 2 недели',
    media: buildMediaSet(
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a',
      'Динамический лендинг для digital-ретейла с кастомным WebGL'
    )
  },
  {
    title: 'Logistics OS · Django',
    description: 'Единый портал с личными кабинетами, картой заказов и SLA-алертами в реальном времени.',
    result: '99.98% uptime · 4 региона',
    media: buildMediaSet(
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
      'Панель для логистики на Django с реальными метриками SLA'
    )
  },
  {
    title: 'AI assistant · Telegram',
    description: 'RAG-бот с модерацией, обучением на контенте и платежами в чате. Снимает нагрузку с поддержки.',
    result: '-60% обращений в helpdesk',
    media: buildMediaSet(
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
      'Интерфейс AI-бота в Telegram с премиальным UI'
    )
  },
  {
    title: 'Last-mile app · Android',
    description: 'MVP с GPS-трекингом, офлайн маршрутами, BLE и интеграцией с ERP/CRM.',
    result: 'релиз за 6 недель',
    media: buildMediaSet(
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      'Android-приложение для курьеров с трекингом доставок'
    )
  }
]

const pricing = [
  {
    title: 'Signature сайты',
    accent: 'aqua',
    items: [
      { label: 'Hero-лендинг / спецпроект', price: '35 000 – 55 000 ₽' },
      { label: 'Каталог / eCom', price: '55 000 – 78 000 ₽' },
      { label: 'Корпоративный портал', price: '75 000 – 110 000 ₽' },
      { label: 'Арт-дирекшн / редизайн', price: '1 600 – 2 100 ₽/час' }
    ]
  },
  {
    title: 'Product engineering',
    accent: 'violet',
    items: [
      { label: 'Web-приложение / SaaS', price: '95 000 – 165 000 ₽' },
      { label: 'Личный кабинет / CRM', price: '120 000 – 210 000 ₽' },
      { label: 'Backend + API', price: '48 000 – 88 000 ₽' },
      { label: 'DevOps / деплой', price: '18 000 – 34 000 ₽' }
    ]
  },
  {
    title: 'AI · Telegram · RAG',
    accent: 'cyan',
    items: [
      { label: 'Smart-бот с админкой', price: '45 000 – 82 000 ₽' },
      { label: 'AI ассистент / RAG', price: '68 000 – 125 000 ₽' },
      { label: 'Интеграции и оплаты', price: '22 000 – 48 000 ₽' }
    ]
  },
  {
    title: 'SEO · Data advisory',
    accent: 'amber',
    items: [
      { label: 'SEO-аудит + дорожная карта', price: '18 000 – 32 000 ₽' },
      { label: 'Data layer / GA4 / BigQuery', price: '12 000 – 28 000 ₽' },
      { label: 'Дэшборды и модели', price: '16 000 – 34 000 ₽' },
      { label: 'Сопровождение', price: '9 500 – 14 500 ₽/мес' }
    ]
  }
]

const steps = [
  { title: 'Vision call', detail: 'Диагностика контекста, артефактов и KPI. Формируем гипотезы и ожидания по тональности.' },
  {
    title: 'Discovery sprint',
    detail: 'Интервью, CJM, data review, выбор референсов, структура продукта и дорожная карта в Notion.'
  },
  {
    title: 'Design system',
    detail: 'Moodboards, типографика, 3D/анимации, интерактивные прототипы во Figma. Утверждаем визуальную систему.'
  },
  { title: 'Development', detail: 'Фронтенд, backend, AI, интеграции, настройки DevOps и окружений.' },
  { title: 'Quality & launch', detail: 'QA, перформанс, безопасность, SEO/data layer, релиз и поддержка.' },
  { title: 'Growth care', detail: 'Мониторинг, отчёты, A/B-тесты, сопровождение команды и итеративные релизы.' }
]

const faq = [
  {
    q: 'Как быстро можно стартовать?',
    a: 'Первый созвон — в течение 12–24 часов. После брифа отправляю vision deck и дорожную карту на первую неделю.'
  },
  {
    q: 'Как проходить юридию и оплату?',
    a: 'Договор/оферта, NDA, безнал/USDT. Все доступы через VPN и менеджер паролей, код — в приватных репозиториях.'
  },
  {
    q: 'Можно подключить вашу команду?',
    a: 'Да. Встраиваю дизайнеров, маркетинг и аналитиков заказчика, веду единый backlog, ретро и weekly демо.'
  },
  {
    q: 'Какой стек используете чаще?',
    a: 'Tilda Zero Block, React/SvelteKit, Django/FastAPI, Postgres, Telegram API, OpenAI/Claude, GA4/BigQuery, Docker.'
  },
  {
    q: 'Что с гарантией и поддержкой?',
    a: '60 дней тех. гарантии + SLA на критические инциденты. Мониторинг, алерты и быстрые фиксы входят в сопровождение.'
  },
  {
    q: 'Работаете ли спринтами?',
    a: 'Да, фиксирую результат каждого спринта, прозрачные отчёты и метрики. Популярный формат — 2-недельные итерации.'
  }
]

// Максимально упрощенная геометрия для максимальной производительности
const FloatingOrb = memo(() => {
  const performanceMode = useMemo(() => {
    // Определяем производительность устройства
    const isLowEnd = navigator.hardwareConcurrency <= 4 || 
                     (navigator.deviceMemory && navigator.deviceMemory <= 4)
    return isLowEnd
  }, [])

  if (performanceMode) {
    // Минимальная версия для слабых устройств
    return (
      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.5}>
        <mesh>
          <octahedronGeometry args={[1.4, 0]} />
          <meshBasicMaterial color="#7cf9ff" transparent opacity={0.8} />
        </mesh>
      </Float>
    )
  }

  return (
    <Float speed={1.4} rotationIntensity={1.2} floatIntensity={2}>
      <mesh>
        <icosahedronGeometry args={[1.6, 16]} />
        <MeshDistortMaterial
          color="#7cf9ff"
          speed={2.5}
          distort={0.3}
          emissive="#00b3ff"
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
    </Float>
  )
})
FloatingOrb.displayName = 'FloatingOrb'

// Максимально упрощенные частицы для максимальной производительности
const HaloParticles = memo(() => {
  const particleCount = useMemo(() => {
    const isLowEnd = navigator.hardwareConcurrency <= 4 || 
                     (navigator.deviceMemory && navigator.deviceMemory <= 4)
    return isLowEnd ? 10 : 15
  }, [])

  const particles = useMemo(() =>
    Array.from({ length: particleCount }, () => ({
      position: [
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ],
      scale: Math.random() * 0.04 + 0.02
    })), [particleCount]
  )

  return (
    <group>
      {particles.map((particle, index) => (
        <mesh key={index} position={particle.position}>
          <sphereGeometry args={[particle.scale, 3, 3]} />
          <meshBasicMaterial color="#9efcff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
})
HaloParticles.displayName = 'HaloParticles'

const SectionTitle = memo(({ eyebrow, title, description, level = 'h2' }) => {
  const HeadingTag = level

  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <HeadingTag>{title}</HeadingTag>
      {description && <p className="section-description">{description}</p>}
    </div>
  )
})
SectionTitle.displayName = 'SectionTitle'

// Утилита для throttle с улучшенной плавностью
const throttle = (func, limit) => {
  let inThrottle
  let lastArgs
  let lastContext
  return function(...args) {
    lastArgs = args
    lastContext = this
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
        if (lastArgs) {
          func.apply(lastContext, lastArgs)
          lastArgs = null
          lastContext = null
        }
      }, limit)
    }
  }
}

function App() {
  const [formMessage, setFormMessage] = useState('')
  
  // Мемоизация stackBadges для предотвращения пересоздания массива
  const stackBadges = useMemo(() => [
    'Tilda Zero Block',
    'SvelteKit',
    'React',
    'Django',
    'FastAPI',
    'Postgres',
    'MySQL',
    'Telegram API',
    'OpenAI',
    'Claude',
    'Three.js',
    'Framer Motion',
    'GA4',
    'BigQuery',
    'Docker',
    'Yandex Cloud',
    'AWS',
    'Notion',
    'Jira',
    'Jetpack Compose'
  ], [])

  // Parallax полностью отключен для максимальной производительности
  // useEffect(() => {}, [])

  // Все scroll обработчики отключены для максимальной производительности
  // useEffect(() => {}, [])

  // Мемоизация обработчиков для предотвращения пересоздания функций
  const handleScrollToSection = useCallback((id) => {
    const element = document.getElementById(id)
    if (!element) return
    
    const startPosition = window.scrollY
    const targetPosition = element.getBoundingClientRect().top + window.scrollY
    const distance = targetPosition - startPosition
    const duration = Math.min(Math.abs(distance) * 0.8, 1200) // Максимум 1.2 секунды
    let startTime = null

    // Улучшенная easing функция для максимальной плавности
    const easeOutCubic = (t) => {
      return 1 - Math.pow(1 - t, 3)
    }

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      const ease = easeOutCubic(progress)

      window.scrollTo({
        top: startPosition + distance * ease,
        behavior: 'auto'
      })

      if (progress < 1) {
        requestAnimationFrame(animation)
      }
    }

    requestAnimationFrame(animation)
  }, [])

  const handleScrollToContact = useCallback(() => handleScrollToSection('contact'), [handleScrollToSection])

  const handleSubmit = useCallback((event) => {
    event.preventDefault()
    setFormMessage('Форма отправлена. Я свяжусь в течение дня.')
    event.currentTarget.reset()
  }, [])

  return (
    <div className="app">
      <div className="background-aurora">
        <span className="aurora aurora-one" />
        <span className="aurora aurora-two" />
      </div>
      <header className="site-header">
        <div className="logo">
          <span>Архипов Даниил</span>
          <small>digital architect</small>
        </div>
        <nav aria-label="Основная навигация">
          <a href="#value">Подход</a>
          <a href="#services">Услуги</a>
          <a href="#portfolio">Проекты</a>
          <a href="#pricing">Стоимость</a>
          <a href="#process">Процесс</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="ghost-button" onClick={handleScrollToContact}>
          Оставить заявку
        </button>
      </header>

      <main className="snap-container">
      <section className="hero snap-section parallax-section" id="hero">
        <div className="hero-visual" aria-hidden="true">
          <Canvas 
            camera={{ position: [0, 0, 5], fov: 42 }}
            dpr={1}
            performance={{ min: 0.5 }}
            frameloop="never"
            gl={{ 
              antialias: false,
              alpha: true,
              powerPreference: 'high-performance',
              stencil: false,
              depth: false,
              precision: 'lowp',
              preserveDrawingBuffer: false
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[4, 4, 2]} intensity={1.2} />
              <directionalLight position={[-4, -2, -2]} intensity={0.6} color="#0ff" />
              <Stars radius={28} depth={40} count={200} factor={2.6} fade speed={0.7} />
              <FloatingOrb />
              <HaloParticles />
            </Suspense>
          </Canvas>
        </div>
        <div className="hero-glow" />
        <div className="hero-grid" />
        <span className="hero-ambient ambient-one" />
        <span className="hero-ambient ambient-two" />
        <div className="hero-surface">
          <div className="hero-content">
            <p className="eyebrow">Full-stack digital atelier · Web · Mobile · AI</p>
            <h1>Премиальная разработка сайтов, приложений и Telegram-ботов</h1>
            <p className="subtitle">
              Разрабатываю SEO-оптимизированные сайты, SaaS и AI-ботов на React, Svelte, Django, Android и Telegram API.
              Отвечаю за стратегию, UX, 3D-анимацию, backend, DevOps и аналитику, чтобы KPI были прозрачными уже на первом спринте.
            </p>
            <div className="hero-cta">
              <button className="primary" onClick={handleScrollToContact}>
                Оставить заявку
              </button>
              <button className="secondary" onClick={() => handleScrollToSection('services')}>
                Смотреть компетенции
              </button>
            </div>
            <div className="hero-tags">
              <span>Современный стек</span>
              <span>3D motion & micro-interactions</span>
              <span>Data-driven решения</span>
            </div>
          </div>
          <div className="hero-side">
            <ul className="hero-stats">
              {heroStats.map((stat) => (
                <li key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <p>{stat.detail}</p>
                </li>
              ))}
            </ul>
            <div className="hero-floating-card">
              <p>Технологический стек</p>
              <strong>React · SvelteKit · Django · FastAPI · Three.js · Telegram · GA4</strong>
              <span>Полный цикл: стратегия → дизайн → код → DevOps → аналитика</span>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span />
          <p>Scroll to explore</p>
        </div>
      </section>

      <section className="value snap-section parallax-section" id="value">
        <SectionTitle
          eyebrow="Signature подход"
          title="Почему выбирают меня"
          description="Совмещаю арт-дирекшн, инженерию и SEO-аналитику: сайты и приложения выглядят премиально, загружаются быстрее конкурентов и стабильно приводят органический трафик."
        />
        <div className="value-grid">
          {signatureHighlights.map((item) => (
            <article
              key={item.title}
              className="value-card"
            >
              <div>
                <p className="eyebrow">{item.metric}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="stack-marquee" aria-label="Tech stack">
          <div className="marquee-track">
            {useMemo(() => [...stackBadges, ...stackBadges].map((badge, index) => (
              <span key={`${badge}-${index}`} className="marquee-item">
                {badge}
              </span>
            )), [stackBadges])}
          </div>
        </div>
      </section>

      <section className="about snap-section parallax-section" id="about">
        <SectionTitle
          eyebrow="Обо мне"
          title="Преимущества"
          description="9 лет развиваю цифровые продукты: от лендингов и SaaS до RAG-ботов и мобильных приложений. Беру ответственность за Core Web Vitals, SEO и бизнес-метрики."
        />
        <div className="about-grid">
          <div className="about-card">
            <h3>Фокус</h3>
            <p>Signature-лендинги, продуктовые сервисы, мобильные клиенты, Telegram-боты, AI-ассистенты и инфраструктура под ними с Core Web Vitals 90+.</p>
          </div>
          <div className="about-card">
            <h3>Инструменты</h3>
            <p>Svelte, React, Django, FastAPI, Python, Kotlin, Tilda, Telegram API, OpenAI/Claude, GA4, BigQuery, Docker, Yandex Cloud.</p>
          </div>
          <div className="about-card">
            <h3>Подход</h3>
            <p>Задаю продуктовый roadmap, подключаю команду заказчика, фиксирую метрики и веду прозрачную коммуникацию в Notion/Jira.</p>
          </div>
        </div>
      </section>

      <section className="services snap-section parallax-section" id="services">
        <SectionTitle
          eyebrow="Услуги"
          title="Услуги"
          description="Каждый сервис закрываю под ключ: аудит, UX/UI, front/back, инфраструктуру, AI и сопровождение. Включаю SEO, Core Web Vitals и аналитику сразу."
        />
        <div className="services-grid">
          {services.map((service) => (
            <article
              key={service.title}
              className="service-card"
            >
              <div className="card-top">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
              <ul>
                {service.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <button className="text-link" onClick={handleScrollToContact}>
                Узнать подробнее →
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio snap-section parallax-section" id="portfolio">
        <SectionTitle
          eyebrow="Портфолио"
          title="Кейсы и доказанные метрики"
          description="Полные материалы по NDA показываю на созвоне. Ниже — выдержка кейсов с открытыми цифрами."
          level="h3"
        />
        <div className="portfolio-grid">
          {portfolio.map((project, index) => (
            <article
              key={project.title}
              className="portfolio-card"
            >
              <picture className="portfolio-image">
                <source type="image/avif" srcSet={project.media.avif} />
                <source type="image/webp" srcSet={project.media.webp} />
                <img
                  src={project.media.fallback}
                  alt={project.media.alt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  width="640"
                  height="360"
                  fetchpriority={index === 0 ? 'high' : 'low'}
                />
              </picture>
              <div className="portfolio-info">
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
                <span>{project.result}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-inline snap-section parallax-section">
        <div className="cta-inline-card">
          <p className="eyebrow">White-glove сопровождение</p>
          <h3>Держу в работе максимум 2–3 проекта, чтобы лично контролировать эстетику, инженерию и метрики.</h3>
          <button className="primary" onClick={handleScrollToContact}>
            Забронировать слот
          </button>
        </div>
      </section>

      <section className="pricing snap-section parallax-section" id="pricing">
        <SectionTitle
          eyebrow="Прайсы"
          title="Цены"
          description="Финальный бюджет фиксирую после брифа. Включаю исследование, дизайн, разработку, QA, релиз, SEO-настройки и сопровождение."
        />
        <div className="pricing-grid">
          {pricing.map((group) => (
            <article
              key={group.title}
              className={`pricing-card ${group.accent}`}
            >
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.price}</strong>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="process snap-section parallax-section" id="process">
        <SectionTitle
          eyebrow="Этапы работы"
          title="Этапы работы"
          description="Обновляю артефакты в Notion/Jira и фиксирую KPI на каждом этапе. Результат каждого спринта — проверяемая метрика."
        />
        <div className="process-timeline">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="process-step"
            >
              <span>{index + 1}</span>
              <div>
                <h4>{step.title}</h4>
                <p>{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="faq snap-section parallax-section" id="faq">
        <SectionTitle
          eyebrow="FAQ"
          title="Частые вопросы"
          description="Ответы на популярные вопросы про формат сотрудничества, оплату и стек."
          level="h3"
        />
        <div className="faq-grid">
          {faq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="contact snap-section parallax-section" id="contact">
        <SectionTitle
          eyebrow="Контакты"
          title="Контакты"
          description="Оставьте ссылку, KPI и сроки. В течение дня вернусь с гипотезой, стеком и диапазоном бюджета."
        />
        <div className="contact-grid">
          <div className="contact-card">
            <p>Лично веду коммуникацию, подключаюсь в Telegram/Slack/Teams и синхронизируюсь по вашему часовому поясу.</p>
            <ul>
              <li>
                <span>Telegram</span>
                <a href={CONTACT.telegramUrl} target="_blank" rel="noreferrer">
                  {CONTACT.telegramHandle}
                </a>
              </li>
              <li>
                <span>Email</span>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
              <li>
                <span>Часовой пояс</span>
                <p>UTC+3 (Москва) · подключаюсь к клиентам по всему миру</p>
              </li>
            </ul>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              Имя
              <input type="text" name="name" placeholder="Иван" required />
            </label>
            <label>
              Telegram
              <input type="text" name="tg" placeholder="@username" required />
            </label>
            <label>
              Задача / ссылка
              <textarea name="task" placeholder="Расскажите о продукте, KPI и сроках..." rows={5} required />
            </label>
            <button type="submit" className="primary wide">
              Отправить заявку
            </button>
            {formMessage && <p className="form-message">{formMessage}</p>}
          </form>
        </div>
      </section>

      <footer className="site-footer snap-section parallax-section">
        <div className="footer-glow" />
        <p>
          © {new Date().getFullYear()} Архипов Даниил · Digital engineering, web, mobile, AI и SEO сопровождение.
        </p>
        <div className="footer-links">
          <a href={CONTACT.telegramUrl} target="_blank" rel="noreferrer">
            {CONTACT.telegramHandle}
          </a>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </div>
      </footer>

      </main>
    </div>
  )
}

export default App
