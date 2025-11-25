import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei'
import { motion as Motion } from 'framer-motion'
import './App.css'

const heroStats = [
  { label: 'Экспертиза', value: '10+ лет', detail: 'Web • Mobile • AI' },
  { label: 'Скорость запуска', value: '2–4 недели', detail: 'от брифа до релиза' },
  { label: 'Рост показателей', value: 'до +38%', detail: 'трафик и конверсия' }
]

const services = [
  {
    title: 'Сайты на Tilda',
    description: 'Премиальные лендинги и каталоги с кастомной логикой.',
    bullets: ['Zero-block, эффекты, 3D', 'SEO + скорость 90+', 'Интеграции CRM/метрика']
  },
  {
    title: 'Svelte + Django + MySQL',
    description: 'Кастомные продукты, CRM, сервисы и порталы.',
    bullets: ['Svelte front + Django API', 'Масштабируемая архитектура', 'CI/CD, облако, безопасность']
  },
  {
    title: 'SEO и аналитика',
    description: 'Точные данные, прозрачная аналитика и рост органики.',
    bullets: ['GA4, Метрика, BigQuery', 'SEO-аудит и тех.правки', 'Скорость, структура, контент']
  },
  {
    title: 'Telegram-боты, AI и RAG',
    description: 'Умные ассистенты, продажи, поддержка и интеграции.',
    bullets: ['GPT, Claude, RAG', 'Оплаты, CRM, вебхуки', 'Свой UI, админки, роли']
  },
  {
    title: 'Android-разработка',
    description: 'Нативные приложения с офлайн логикой и API.',
    bullets: ['Jetpack Compose', 'GPS, камера, BLE', 'Публикация и поддержка']
  },
  {
    title: 'Аналитика и Excel-модели',
    description: 'Финансовые модели, отчеты, автоматизация процессов.',
    bullets: ['Power Query, VBA', 'Дэшборды под ключ', 'Сценарное моделирование']
  },
  {
    title: 'Программирование и интеграции',
    description: 'Python, C++, Java, Kotlin — решаю сложные задачи.',
    bullets: ['API/ETL/микросервисы', 'Парсеры и скрипты', 'Интеграции ERP/CRM']
  }
]

const portfolio = [
  {
    title: 'Tilda / digital-ритейл',
    description: 'Лендинг с 3D-анимацией, Zero-block и связкой с CRM.',
    result: '+42% к заявкам',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Django веб-сервис',
    description: 'Система управления логистикой + личные кабинеты.',
    result: '99.98% uptime',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'AI Telegram-бот',
    description: 'RAG-помощник для службы поддержки с памятью контекста.',
    result: '-60% нагрузка на операторов',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Android-приложение',
    description: 'MVP сервиса доставки с GPS-трекингом и офлайн режимом.',
    result: 'релиз за 6 недель',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80'
  }
]

const pricing = [
  {
    title: 'Сайты на Tilda',
    accent: 'aqua',
    items: [
      { label: 'Лендинг', price: '23 500 – 33 000 ₽' },
      { label: 'Многостраничный сайт', price: '38 000 – 52 000 ₽' },
      { label: 'Корпоративный сайт', price: '57 000 – 76 000 ₽' },
      { label: 'Каталог', price: '42 500 – 57 000 ₽' },
      { label: 'Редизайн', price: '1 150 – 1 700 ₽/час' },
      { label: 'Поддержка', price: '7 600 – 11 400 ₽' }
    ]
  },
  {
    title: 'Svelte/Django',
    accent: 'violet',
    items: [
      { label: 'Веб-приложение', price: '57 000 – 76 000 ₽' },
      { label: 'Личный кабинет / CRM', price: '85 500 – 114 000 ₽' },
      { label: 'Веб-сервис', price: '142 500 – 209 000 ₽' },
      { label: 'Backend API', price: '28 500 – 47 500 ₽' },
      { label: 'Интеграции', price: '14 250 – 28 500 ₽' },
      { label: 'Деплой', price: '9 500 – 19 000 ₽' }
    ]
  },
  {
    title: 'SEO / Аналитика',
    accent: 'amber',
    items: [
      { label: 'SEO-аудит', price: '9 500 – 14 250 ₽' },
      { label: 'Тех. SEO', price: '14 250 – 23 750 ₽' },
      { label: 'SEO на Tilda', price: '7 600 – 11 400 ₽' },
      { label: 'Скорость', price: '5 700 – 9 500 ₽' },
      { label: 'Метрика / GA4', price: '4 750 – 7 600 ₽' },
      { label: 'Вебмастер', price: '1 900 – 2 850 ₽' },
      { label: 'События', price: '5 700 – 9 500 ₽' },
      { label: 'Дашборды', price: '9 500 – 19 000 ₽' }
    ]
  },
  {
    title: 'Telegram-боты',
    accent: 'cyan',
    items: [
      { label: 'Простой', price: '14 250 – 23 750 ₽' },
      { label: 'Админка / CRM', price: '28 500 – 47 500 ₽' },
      { label: 'AI', price: '38 000 – 66 500 ₽' },
      { label: 'RAG', price: '66 500 – 114 000 ₽' },
      { label: 'Оплаты', price: '9 500 – 19 000 ₽' }
    ]
  },
  {
    title: 'Android',
    accent: 'pink',
    items: [
      { label: 'GPS', price: '57 000 – 85 500 ₽' },
      { label: 'Фото', price: '47 500 – 76 000 ₽' },
      { label: 'Клиент API', price: '66 500 – 114 000 ₽' },
      { label: 'MVP', price: '95 000 – 171 000 ₽' },
      { label: 'Публикация', price: '4 750 – 9 500 ₽' }
    ]
  },
  {
    title: 'Аналитика / Excel',
    accent: 'lime',
    items: [
      { label: 'Модель', price: '9 500 – 19 000 ₽' },
      { label: 'Автоматизация', price: '4 750 – 11 400 ₽' },
      { label: 'Большой Excel', price: '5 700 – 14 250 ₽' },
      { label: 'Статистика', price: '11 400 – 19 000 ₽' }
    ]
  },
  {
    title: 'Программирование',
    accent: 'blue',
    items: [
      { label: 'Скрипт', price: '7 600 – 14 250 ₽' },
      { label: 'Парсер', price: '14 250 – 28 500 ₽' },
      { label: 'Интеграция', price: '19 000 – 38 000 ₽' },
      { label: 'Алгоритмы', price: '9 500 – 19 000 ₽' },
      { label: 'Консультация', price: '1 425 ₽/час' }
    ]
  }
]

const steps = [
  { title: 'Созвон', detail: 'Уточняем задачу, KPI и сроки. 30 минут по делу.' },
  { title: 'Аналитика', detail: 'Исследование ниши, пользователей, данных.' },
  { title: 'Прототип', detail: 'Сценарии, CJM, дизайн-концепт, согласование.' },
  { title: 'Разработка', detail: 'Фронтенд, бэкенд, нейросети, интеграции.' },
  { title: 'Тестирование', detail: 'QA, нагрузка, безопасность, SEO.' },
  { title: 'Публикация', detail: 'Деплой, сторы, домены, документация.' },
  { title: 'Поддержка', detail: 'Мониторинг, аналитика, доработки.' }
]

const faq = [
  {
    q: 'Как быстро стартуем?',
    a: 'Созвон и диагностика в течение 24 часов. После согласования брифа начинаю прототип сразу.'
  },
  {
    q: 'Что с юридическими вопросами?',
    a: 'Работаю по договору, актам и безналу/РФ. Возможны NDA и доступы через VPN.'
  },
  {
    q: 'Можно ли подключить мою команду?',
    a: 'Да. Организую прозрачный процесс в Notion/Jira, синхронизируюсь с дизайнерами и маркетингом.'
  },
  {
    q: 'Есть ли гарантия на проекты?',
    a: 'Техническая гарантия 60 дней, мониторинг и быстрые фиксы. Для Tilda и ботов — SLA по договору.'
  },
  {
    q: 'Как работает AI/RAG блок?',
    a: 'Настраиваю pipeline: сбор данных, векторное хранилище, промт-дизайн, защиту от утечек и панель модерации.'
  },
  {
    q: 'Что по рассрочке и этапам?',
    a: 'Плачу проект на этапы 40/40/20 или ежемесячные спринты — прозрачно фиксирую результат каждого шага.'
  },
  {
    q: 'Поддержка после релиза обязательна?',
    a: 'Нет, но рекомендую. Есть тарифы на сопровождение, мониторинг и доработки по гибкой ставке.'
  }
]

const FloatingOrb = () => (
  <Float speed={1.4} rotationIntensity={1.2} floatIntensity={2}>
    <mesh castShadow>
      <icosahedronGeometry args={[1.6, 64]} />
      <MeshDistortMaterial
        color="#7cf9ff"
        speed={2.5}
        distort={0.4}
        emissive="#00b3ff"
        emissiveIntensity={0.8}
        roughness={0.25}
        metalness={0.15}
      />
    </mesh>
  </Float>
)

const HaloParticles = () => {
  const [particles] = useState(() =>
    Array.from({ length: 90 }, () => ({
      position: [
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ],
      scale: Math.random() * 0.06 + 0.02
    }))
  )

  return (
    <group>
      {particles.map((particle, index) => (
        <mesh key={index} position={particle.position}>
          <sphereGeometry args={[particle.scale, 8, 8]} />
          <meshBasicMaterial color="#9efcff" />
        </mesh>
      ))}
    </group>
  )
}

const SectionTitle = ({ eyebrow, title, description }) => (
  <Motion.div
    className="section-heading"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true, amount: 0.4 }}
  >
    <p className="eyebrow">{eyebrow}</p>
    <h2>{title}</h2>
    {description && <p className="section-description">{description}</p>}
  </Motion.div>
)

function App() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [formMessage, setFormMessage] = useState('')

  useEffect(() => {
    const handleMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 30
      const y = (event.clientY / window.innerHeight - 0.5) * 30
      setParallax({ x, y })
    }

    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  const handleScrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setFormMessage('Форма отправлена. Я свяжусь в течение дня.')
    event.currentTarget.reset()
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="logo">Архипов Даниил</div>
        <nav>
          <a href="#services">Услуги</a>
          <a href="#portfolio">Портфолио</a>
          <a href="#pricing">Прайсы</a>
          <a href="#process">Этапы</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="ghost-button" onClick={handleScrollToContact}>
          Оставить заявку
        </button>
      </header>

      <section className="hero" id="hero">
        <div
          className="hero-glow"
          style={{ transform: `translate3d(${parallax.x / 4}px, ${parallax.y / 4}px, 0)` }}
        />
        <div className="hero-grid" />
        <Motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="eyebrow">IT · WEB · AI · MOBILE</p>
          <h1>Создаю сайты, ботов и приложения, которые выделяются</h1>
          <p className="subtitle">
            Web, мобильная разработка, AI-боты, SEO, сложные сервисы. Профессионально. Честно. Под ключ.
          </p>
          <div className="hero-cta">
            <button className="primary" onClick={handleScrollToContact}>
              Оставить заявку
            </button>
            <button className="secondary" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
              Показать компетенции
            </button>
          </div>
          <Motion.ul
            className="hero-stats"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            {heroStats.map((stat) => (
              <Motion.li key={stat.label} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <p>{stat.detail}</p>
              </Motion.li>
            ))}
          </Motion.ul>
        </Motion.div>

        <Motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[4, 4, 2]} intensity={1.2} />
              <directionalLight position={[-4, -2, -2]} intensity={0.6} color="#0ff" />
              <Stars radius={20} depth={30} count={4000} factor={3} fade speed={1} />
              <FloatingOrb />
              <HaloParticles />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
            </Suspense>
          </Canvas>
        </Motion.div>
      </section>

      <section className="about" id="about">
        <SectionTitle
          eyebrow="Обо мне"
          title="Tilda, Svelte, Django, Android, Python, AI-боты, аналитика, интеграции."
          description="Занимаюсь сложными продуктами и цифровыми экосистемами. Собираю стек под задачу, страхую риски и держу KPI."
        />
        <div className="about-grid">
          <Motion.div
            className="about-card"
            whileHover={{ y: -10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <h3>Фокус</h3>
            <p>Создаю премиальные цифровые продукты: от лендингов и бот-ассистентов до сервисов с backend и мобильными клиентами.</p>
          </Motion.div>
          <Motion.div
            className="about-card"
            whileHover={{ y: -10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <h3>Инструменты</h3>
            <p>Svelte, React, Django, FastAPI, Python, Kotlin, GA4, BigQuery, Postgres, Tilda, Telegram API, OpenAI, Claude.</p>
          </Motion.div>
          <Motion.div
            className="about-card"
            whileHover={{ y: -10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <h3>Подход</h3>
            <p>Делаю прозрачные дорожные карты, работаю спринтами, подключаю trusted-партнеров и закрываю вопросы по аналитике, SEO и DevOps.</p>
          </Motion.div>
        </div>
      </section>

      <section className="services" id="services">
        <SectionTitle
          eyebrow="Услуги"
          title="7 продуктовых направлений"
          description="Каждый сегмент включает проработку стратегии, дизайн, разработку, QA, аналитику и поддержку."
        />
        <div className="services-grid">
          {services.map((service) => (
            <Motion.article
              key={service.title}
              className="service-card"
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
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
            </Motion.article>
          ))}
        </div>
      </section>

      <section className="portfolio" id="portfolio">
        <SectionTitle
          eyebrow="Портфолио"
          title="Цифровые продукты и кейсы"
          description="Визуалы заглушены mock-форматами. В реальных проектах использую кастомные 3D-сцены, съемку и брендовые ассеты."
        />
        <div className="portfolio-grid">
          {portfolio.map((project) => (
            <Motion.article
              key={project.title}
              className="portfolio-card"
              whileHover={{ rotateX: -2, rotateY: 2, y: -6 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            >
              <div className="portfolio-image" style={{ backgroundImage: `url(${project.image})` }} />
              <div className="portfolio-info">
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
                <span>{project.result}</span>
              </div>
            </Motion.article>
          ))}
        </div>
      </section>

      <section className="pricing" id="pricing">
        <SectionTitle
          eyebrow="Прайсы"
          title="Стоимость на 5% ниже рынка"
          description="Финальные бюджеты фиксируются после брифа. Включаю анализ, дизайн, разработку, тестирование и релиз."
        />
        <div className="pricing-grid">
          {pricing.map((group) => (
            <Motion.article
              key={group.title}
              className={`pricing-card ${group.accent}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
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
            </Motion.article>
          ))}
        </div>
      </section>

      <section className="process" id="process">
        <SectionTitle
          eyebrow="Этапы работы"
          title="Прозрачная дорожная карта"
          description="Трекинг в Notion + Jira. Каждая стадия подтверждается демо, аналитикой и чек-листами."
        />
        <div className="process-timeline">
          {steps.map((step, index) => (
            <Motion.div
              key={step.title}
              className="process-step"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <span>{index + 1}</span>
              <div>
                <h4>{step.title}</h4>
                <p>{step.detail}</p>
              </div>
            </Motion.div>
          ))}
        </div>
      </section>

      <section className="faq" id="faq">
        <SectionTitle
          eyebrow="FAQ"
          title="Вопросы и ответы"
          description="Если не нашли ответа — напишите в форму ниже, и я быстро включусь в проект."
        />
        <div className="faq-grid">
          {faq.map((item) => (
            <details key={item.q} open>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="contact" id="contact">
        <SectionTitle
          eyebrow="Контакты"
          title="Готов подключиться"
          description="Заполните форму, укажите задачу, дайте ссылку на бриф или прототип — предложу архитектуру и оценку в течение 24 часов."
        />
        <div className="contact-grid">
          <div className="contact-card">
            <p>Оставьте заявку — отвечу лично, без менеджеров.</p>
            <ul>
              <li>
                <span>Telegram</span>
                <a href="https://t.me/arkhipovdan" target="_blank" rel="noreferrer">
                  @arkhipovdan
                </a>
              </li>
              <li>
                <span>Email</span>
                <a href="mailto:hello@arkhipov.dev">hello@arkhipov.dev</a>
              </li>
              <li>
                <span>Часовой пояс</span>
                <p>UTC+3 (Москва) · работаю с клиентами по всему миру</p>
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

      <footer className="site-footer">
        <div className="footer-glow" />
        <p>© {new Date().getFullYear()} Архипов Даниил. Разработка премиальных цифровых продуктов.</p>
        <div>
          <span>Web · Mobile · AI · Data</span>
        </div>
      </footer>
      </div>
  )
}

export default App
