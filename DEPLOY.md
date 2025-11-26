# Инструкция по деплою на VPS с несколькими доменами

Эта инструкция поможет настроить два сайта на одном VPS сервере с использованием nginx reverse proxy.

## Архитектура

```
Internet
   ↓
nginx-proxy (порт 80) ← принимает все запросы
   ↓
   ├─→ arhipovdan.ru → fllanding контейнер (внутренний порт)
   └─→ nikitintex.ru → nikitintex контейнер (внутренний порт)
```

## Предварительные требования

1. VPS сервер с установленным Docker и Docker Compose
2. Два домена, настроенных на IP адрес вашего VPS:
   - `arhipovdan.ru`
   - `nikitintex.ru`
3. SSH доступ к серверу

## Шаг 1: Подготовка первого сайта (nikitintex.ru)

Если у вас уже есть контейнер для первого сайта:

1. Узнайте имя контейнера:
   ```bash
   docker ps
   ```

2. Откройте файл `nginx/conf.d/nikitintex.ru.conf` и замените `nikitintex-container` на реальное имя вашего контейнера.

3. Если первый сайт еще не запущен в Docker, добавьте его в `docker-compose.yml`:
   ```yaml
   nikitintex:
     image: your-nikitintex-image:latest
     container_name: nikitintex-container
     restart: unless-stopped
     expose:
       - "80"
     networks:
       - web-network
   ```

## Шаг 2: Настройка DNS

Убедитесь, что оба домена указывают на IP адрес вашего VPS:

```
A запись:
arhipovdan.ru     → IP_VPS
www.arhipovdan.ru → IP_VPS
nikitintex.ru     → IP_VPS
www.nikitintex.ru → IP_VPS
```

Проверка:
```bash
dig arhipovdan.ru
dig nikitintex.ru
```

## Шаг 3: Клонирование проекта на сервер

```bash
# На сервере
cd /opt  # или другая директория
git clone <your-repo-url> FLLanding
cd FLLanding
```

## Шаг 4: Настройка конфигурации nginx

1. Проверьте файл `nginx/conf.d/nikitintex.ru.conf`:
   - Убедитесь, что имя контейнера совпадает с реальным именем
   - При необходимости отредактируйте настройки

2. Проверьте файл `nginx/conf.d/arhipovdan.ru.conf`:
   - Конфигурация уже настроена для `fllanding` контейнера

## Шаг 5: Первый деплой

```bash
# Сделать скрипт исполняемым
chmod +x deploy.sh

# Деплой с использованием docker-compose
./deploy.sh --compose
```

Скрипт автоматически:
- Обновит код из git
- Соберет Docker образ
- Запустит nginx-proxy и fllanding контейнеры
- Настроит сеть между контейнерами

## Шаг 6: Проверка работы

1. Проверьте статус контейнеров:
   ```bash
   docker-compose ps
   # или
   docker ps
   ```

2. Проверьте логи nginx:
   ```bash
   docker-compose logs nginx-proxy
   ```

3. Проверьте доступность сайтов:
   ```bash
   curl -H "Host: arhipovdan.ru" http://localhost
   curl -H "Host: nikitintex.ru" http://localhost
   ```

4. Откройте в браузере:
   - http://arhipovdan.ru
   - http://nikitintex.ru

## Шаг 7: Настройка SSL (опционально, но рекомендуется)

Для настройки HTTPS используйте Let's Encrypt:

1. Установите certbot:
   ```bash
   sudo apt-get update
   sudo apt-get install certbot
   ```

2. Получите сертификаты:
   ```bash
   sudo certbot certonly --standalone -d arhipovdan.ru -d www.arhipovdan.ru
   sudo certbot certonly --standalone -d nikitintex.ru -d www.nikitintex.ru
   ```

3. Обновите конфигурацию nginx для поддержки SSL (см. раздел ниже)

## Обновление проекта

Для обновления проекта после изменений:

```bash
./deploy.sh --compose
```

Или без пересборки образа (если код не изменился):
```bash
./deploy.sh --compose --no-build
```

## Управление контейнерами

```bash
# Просмотр статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f fllanding
docker-compose logs -f nginx-proxy

# Перезапуск контейнера
docker-compose restart fllanding

# Остановка всех контейнеров
docker-compose down

# Запуск всех контейнеров
docker-compose up -d
```

## Настройка SSL/HTTPS

Для добавления SSL сертификатов:

1. Обновите `docker-compose.yml`, добавив volumes для сертификатов:
   ```yaml
   nginx-proxy:
     volumes:
       - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
       - ./nginx/conf.d:/etc/nginx/conf.d:ro
       - /etc/letsencrypt:/etc/letsencrypt:ro
       - nginx-logs:/var/log/nginx
   ```

2. Обновите конфигурации в `nginx/conf.d/` для поддержки SSL:
   ```nginx
   server {
       listen 80;
       server_name arhipovdan.ru www.arhipovdan.ru;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name arhipovdan.ru www.arhipovdan.ru;

       ssl_certificate /etc/letsencrypt/live/arhipovdan.ru/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/arhipovdan.ru/privkey.pem;

       # ... остальная конфигурация
   }
   ```

3. Перезапустите nginx:
   ```bash
   docker-compose restart nginx-proxy
   ```

## Решение проблем

### Порт 80 уже занят

Если порт 80 занят другим процессом:

```bash
# Найти процесс, использующий порт 80
sudo lsof -i :80
# или
sudo netstat -tulpn | grep :80

# Остановите процесс или измените конфигурацию
```

### Контейнер не запускается

Проверьте логи:
```bash
docker-compose logs fllanding
docker-compose logs nginx-proxy
```

### Сайт не доступен

1. Проверьте DNS:
   ```bash
   dig arhipovdan.ru
   ```

2. Проверьте конфигурацию nginx:
   ```bash
   docker-compose exec nginx-proxy nginx -t
   ```

3. Проверьте, что контейнеры в одной сети:
   ```bash
   docker network inspect fllanding_web-network
   ```

### Ошибка "upstream not found"

Убедитесь, что имя контейнера в nginx конфигурации совпадает с именем в docker-compose.yml.

## Структура файлов

```
.
├── docker-compose.yml          # Конфигурация всех контейнеров
├── deploy.sh                   # Скрипт деплоя
├── Dockerfile                  # Dockerfile для FLLanding
├── nginx/
│   ├── nginx.conf              # Основная конфигурация nginx
│   └── conf.d/
│       ├── arhipovdan.ru.conf  # Конфигурация для arhipovdan.ru
│       └── nikitintex.ru.conf  # Конфигурация для nikitintex.ru
└── ...
```

## Дополнительные настройки

### Изменение портов

Если нужно использовать другой порт для nginx-proxy, измените в `docker-compose.yml`:
```yaml
nginx-proxy:
  ports:
    - "8080:80"  # Вместо "80:80"
```

### Добавление третьего сайта

1. Создайте новый файл `nginx/conf.d/third-site.ru.conf`
2. Добавьте сервис в `docker-compose.yml`
3. Перезапустите: `docker-compose up -d`

