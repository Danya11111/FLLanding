# Пошаговый алгоритм настройки двух доменов на VPS

## Шаг 1: Проверка текущего состояния

### 1.1. Узнайте имя контейнера для первого сайта (nikitintex.ru)

```bash
docker ps
```

Найдите контейнер, который обслуживает первый сайт. Запишите его имя (например, `gooddriveweb-app`).

### 1.2. Проверьте, на каком порту работает первый контейнер

```bash
docker inspect <имя-контейнера> | grep -A 10 "ExposedPorts"
# или
docker port <имя-контейнера>
```

Обычно это порт 80 внутри контейнера.

## Шаг 2: Настройка конфигурации nginx

### 2.1. Откройте файл `nginx/conf.d/nikitintex.ru.conf`

Убедитесь, что имя контейнера в строке `proxy_pass` совпадает с реальным именем:

```nginx
proxy_pass http://gooddriveweb-app:80;  # ← должно совпадать с именем из docker ps
```

Если имя другое — замените `gooddriveweb-app` на правильное.

### 2.2. Проверьте конфигурацию для arhipovdan.ru

Файл `nginx/conf.d/arhipovdan.ru.conf` уже настроен правильно:
- `proxy_pass http://fllanding:80;` — это имя контейнера из docker-compose.yml

## Шаг 3: Проверка DNS

### 3.1. Убедитесь, что домены указывают на IP вашего VPS

```bash
# На вашем компьютере или на сервере
dig arhipovdan.ru
dig nikitintex.ru
```

Оба должны показывать IP адрес вашего VPS сервера.

### 3.2. Если DNS не настроен

Настройте A-записи у вашего регистратора домена:
- `arhipovdan.ru` → IP_VPS
- `www.arhipovdan.ru` → IP_VPS
- `nikitintex.ru` → IP_VPS
- `www.nikitintex.ru` → IP_VPS

## Шаг 4: Подготовка на сервере

### 4.1. Подключитесь к серверу

```bash
ssh user@your-vps-ip
```

### 4.2. Перейдите в директорию проекта

```bash
cd /path/to/FLLanding  # или где у вас проект
```

### 4.3. Убедитесь, что файлы на месте

```bash
ls -la nginx/conf.d/
# Должны быть:
# - arhipovdan.ru.conf
# - nikitintex.ru.conf

ls -la docker-compose.yml
ls -la deploy.sh
```

## Шаг 5: Подключение первого контейнера к сети

### 5.1. Создайте сеть (если еще не создана)

```bash
docker network create fllanding_web-network 2>/dev/null || echo "Сеть уже существует"
```

### 5.2. Подключите первый контейнер к сети

```bash
docker network connect fllanding_web-network <имя-контейнера-первого-сайта>
```

Например:
```bash
docker network connect fllanding_web-network gooddriveweb-app
```

### 5.3. Проверьте подключение

```bash
docker network inspect fllanding_web-network
```

В списке `Containers` должны быть оба контейнера (или будет после запуска fllanding).

## Шаг 6: Остановка старого nginx (если запущен)

### 6.1. Проверьте, не занят ли порт 80

```bash
sudo lsof -i :80
# или
sudo netstat -tulpn | grep :80
```

### 6.2. Если порт 80 занят системным nginx

```bash
# Остановите системный nginx
sudo systemctl stop nginx
sudo systemctl disable nginx  # чтобы не запускался автоматически
```

Или измените порт в docker-compose.yml на другой (например, 8080).

## Шаг 7: Деплой

### 7.1. Сделайте скрипт исполняемым

```bash
chmod +x deploy.sh
```

### 7.2. Запустите деплой

```bash
./deploy.sh --compose
```

Скрипт:
- Обновит код из git
- Соберет образ для fllanding
- Запустит nginx-proxy и fllanding контейнеры
- Подключит их к одной сети

## Шаг 8: Проверка работы

### 8.1. Проверьте статус контейнеров

```bash
docker-compose ps
# или
docker ps
```

Должны быть запущены:
- `nginx-proxy`
- `fllanding`
- ваш первый контейнер (например, `gooddriveweb-app`)

### 8.2. Проверьте, что все в одной сети

```bash
docker network inspect fllanding_web-network
```

Все три контейнера должны быть в списке.

### 8.3. Проверьте конфигурацию nginx

```bash
docker-compose exec nginx-proxy nginx -t
```

Должно быть: `nginx: configuration file /etc/nginx/nginx.conf test is successful`

### 8.4. Проверьте логи nginx

```bash
docker-compose logs nginx-proxy
```

Не должно быть ошибок типа "upstream not found" или "connection refused".

### 8.5. Тест локально на сервере

```bash
# Тест arhipovdan.ru
curl -H "Host: arhipovdan.ru" http://localhost

# Тест nikitintex.ru
curl -H "Host: nikitintex.ru" http://localhost
```

Оба должны возвращать HTML код (не ошибку 502 или connection refused).

### 8.6. Тест через браузер

Откройте в браузере:
- http://arhipovdan.ru
- http://nikitintex.ru

Оба должны открываться и показывать правильные сайты.

## Шаг 9: Решение проблем

### Проблема: 502 Bad Gateway

**Причина:** nginx не может подключиться к контейнеру.

**Решение:**
1. Проверьте, что контейнер запущен:
   ```bash
   docker ps | grep gooddriveweb-app
   docker ps | grep fllanding
   ```

2. Проверьте, что контейнеры в одной сети:
   ```bash
   docker network inspect fllanding_web-network
   ```

3. Проверьте имя контейнера в nginx конфиге:
   ```bash
   grep proxy_pass nginx/conf.d/*.conf
   ```
   Имена должны совпадать с именами из `docker ps`.

4. Проверьте, что контейнер слушает порт 80:
   ```bash
   docker exec <имя-контейнера> netstat -tuln | grep 80
   ```

### Проблема: Connection refused

**Причина:** Контейнер не подключен к сети или не запущен.

**Решение:**
```bash
# Подключите контейнер к сети
docker network connect fllanding_web-network <имя-контейнера>

# Перезапустите nginx-proxy
docker-compose restart nginx-proxy
```

### Проблема: Сайт открывается, но показывает неправильный контент

**Причина:** Неправильная маршрутизация по доменам.

**Решение:**
1. Проверьте `server_name` в конфигах:
   ```bash
   grep server_name nginx/conf.d/*.conf
   ```

2. Убедитесь, что DNS настроен правильно:
   ```bash
   dig arhipovdan.ru
   dig nikitintex.ru
   ```

### Проблема: Порт 80 занят

**Решение:**
1. Найдите процесс:
   ```bash
   sudo lsof -i :80
   ```

2. Остановите его или измените порт в docker-compose.yml:
   ```yaml
   ports:
     - "8080:80"  # вместо "80:80"
   ```

## Шаг 10: Финальная проверка

### Чек-лист:

- [ ] Оба контейнера запущены (`docker ps`)
- [ ] Оба контейнера в одной сети (`docker network inspect`)
- [ ] Имена контейнеров в nginx конфигах правильные
- [ ] DNS настроен (оба домена указывают на IP VPS)
- [ ] Порт 80 свободен или используется nginx-proxy
- [ ] `nginx -t` проходит без ошибок
- [ ] `curl` тесты возвращают HTML
- [ ] Сайты открываются в браузере

## Полезные команды для мониторинга

```bash
# Логи nginx в реальном времени
docker-compose logs -f nginx-proxy

# Логи конкретного контейнера
docker-compose logs -f fllanding
docker logs -f gooddriveweb-app

# Статус всех контейнеров
docker-compose ps

# Перезапуск nginx после изменения конфига
docker-compose restart nginx-proxy

# Проверка конфигурации nginx
docker-compose exec nginx-proxy nginx -t

# Перезагрузка конфигурации nginx без перезапуска
docker-compose exec nginx-proxy nginx -s reload
```

