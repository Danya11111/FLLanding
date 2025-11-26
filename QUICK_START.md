# Быстрый старт: Деплой двух сайтов на одном VPS

## Шаг 1: Подготовка первого сайта

Если у вас уже есть контейнер для `nikitintex.ru`:

1. Узнайте имя контейнера:
   ```bash
   docker ps
   ```

2. Откройте `nginx/conf.d/nikitintex.ru.conf` и замените `nikitintex-container` на реальное имя вашего контейнера.

3. Убедитесь, что контейнер подключен к сети `web-network`:
   ```bash
   docker network connect fllanding_web-network <имя-контейнера>
   ```

Если контейнера еще нет, добавьте его в `docker-compose.yml` (см. комментарии в файле).

## Шаг 2: Деплой

```bash
chmod +x deploy.sh
./deploy.sh --compose
```

Готово! Сайты должны быть доступны:
- http://arhipovdan.ru
- http://nikitintex.ru

## Проверка

```bash
# Статус контейнеров
docker-compose ps

# Логи
docker-compose logs -f nginx-proxy
docker-compose logs -f fllanding

# Тест доступности
curl -H "Host: arhipovdan.ru" http://localhost
curl -H "Host: nikitintex.ru" http://localhost
```

## Обновление

```bash
./deploy.sh --compose
```

Подробная инструкция: [DEPLOY.md](./DEPLOY.md)

