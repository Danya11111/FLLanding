# FLLanding

Премиальный лендинг IT-фрилансера Архипова Даниила.  
Стек: React 19 + Vite, Framer Motion, @react-three/fiber/@drei для 3D-сцены, кастомный CSS.

## Скрипты

```bash
npm install        # установка зависимостей
npm run dev        # локальная разработка с HMR
npm run build      # сборка production-версии (dist/)
npm run preview    # предпросмотр собранной версии
npm run lint       # проверка ESLint
```

## Запуск в Docker

1. Соберите образ:

```bash
docker build -t fllanding .
```

2. Запустите контейнер, пробросив порт 80 на хост:

```bash
docker run --rm -p 8080:80 fllanding
```

3. Откройте http://localhost:8080 — лендинг будет доступен из контейнера nginx, который отдает production-сборку Vite.

## Структура

- `src/App.jsx` — основная страница со всеми секциями.
- `src/App.css`, `src/index.css` — глобальные стили и шрифты.
- `Dockerfile` — многоэтапная сборка (Node builder + nginx runtime).
- `.dockerignore` — исключения для более быстрой docker-сборки.
