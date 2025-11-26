#!/bin/bash

# FLLanding Deployment Script
# Скрипт для деплоя проекта на сервере
# Использование: ./deploy.sh [--branch BRANCH] [--port PORT] [--no-pull] [--no-build]

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Параметры по умолчанию
BRANCH="${DEPLOY_BRANCH:-main}"
PORT="${DEPLOY_PORT:-80}"
IMAGE_NAME="fllanding:latest"
CONTAINER_NAME="fllanding"
PROJECT_DIR="${DEPLOY_DIR:-$(pwd)}"
SKIP_PULL=false
SKIP_BUILD=false
BACKUP_DIR="${BACKUP_DIR:-./backups}"
USE_COMPOSE=false  # Использовать docker-compose если доступен

# Функция для вывода сообщений
log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Парсинг аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        --branch)
            BRANCH="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --no-pull)
            SKIP_PULL=true
            shift
            ;;
        --no-build)
            SKIP_BUILD=true
            shift
            ;;
        --compose)
            USE_COMPOSE=true
            shift
            ;;
        --help)
            echo "Использование: $0 [OPTIONS]"
            echo ""
            echo "Опции:"
            echo "  --branch BRANCH    Ветка для деплоя (по умолчанию: main)"
            echo "  --port PORT        Порт хоста для проброса (по умолчанию: 80, не используется с --compose)"
            echo "  --no-pull          Пропустить обновление из git"
            echo "  --no-build         Пропустить сборку Docker образа"
            echo "  --compose          Использовать docker-compose для деплоя"
            echo "  --help             Показать эту справку"
            echo ""
            echo "Переменные окружения:"
            echo "  DEPLOY_BRANCH      Ветка для деплоя"
            echo "  DEPLOY_PORT        Порт хоста"
            echo "  DEPLOY_DIR         Директория проекта"
            echo "  BACKUP_DIR         Директория для бэкапов"
            exit 0
            ;;
        *)
            log_error "Неизвестный параметр: $1"
            echo "Используйте --help для справки"
            exit 1
            ;;
    esac
done

# Заголовок
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   FLLanding Deployment Script${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Проверка наличия Docker
log_info "Проверка Docker..."
if ! command -v docker &> /dev/null; then
    log_error "Docker не установлен или не доступен"
    exit 1
fi

if ! docker info &> /dev/null; then
    log_error "Docker daemon не запущен"
    exit 1
fi
log_success "Docker доступен"

# Переход в директорию проекта
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Директория проекта не найдена: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"
log_info "Рабочая директория: $(pwd)"

# Проверка наличия docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        USE_COMPOSE=true
        log_info "Обнаружен docker-compose.yml, будет использован docker-compose"
    fi
fi

# Проверка наличия Dockerfile
if [ ! -f "Dockerfile" ]; then
    log_error "Dockerfile не найден в директории проекта"
    exit 1
fi

# Обновление кода из git (если это git репозиторий)
if [ -d ".git" ] && [ "$SKIP_PULL" = false ]; then
    log_info "Обновление кода из git (ветка: $BRANCH)..."
    
    # Сохранение текущей ветки
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
    
    # Переключение на нужную ветку
    if [ -n "$CURRENT_BRANCH" ]; then
        git fetch origin 2>/dev/null || log_warning "Не удалось выполнить git fetch"
        
        if git show-ref --verify --quiet refs/heads/"$BRANCH"; then
            git checkout "$BRANCH" 2>/dev/null || log_warning "Не удалось переключиться на ветку $BRANCH"
        elif git show-ref --verify --quiet refs/remotes/origin/"$BRANCH"; then
            git checkout -b "$BRANCH" "origin/$BRANCH" 2>/dev/null || log_warning "Не удалось создать ветку $BRANCH"
        fi
        
        git pull origin "$BRANCH" 2>/dev/null || log_warning "Не удалось выполнить git pull"
        log_success "Код обновлен"
    else
        log_warning "Не удалось определить текущую ветку git, пропускаем обновление"
    fi
else
    if [ "$SKIP_PULL" = true ]; then
        log_info "Пропуск обновления из git (--no-pull)"
    else
        log_warning "Не найден git репозиторий, пропускаем обновление"
    fi
fi

# Создание директории для бэкапов
mkdir -p "$BACKUP_DIR"

# Бэкап старого контейнера (если существует)
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log_info "Создание бэкапа старого контейнера..."
    BACKUP_FILE="${BACKUP_DIR}/backup-$(date +%Y%m%d-%H%M%S).tar"
    
    # Экспорт образа старого контейнера
    OLD_IMAGE=$(docker inspect -f '{{.Config.Image}}' "$CONTAINER_NAME" 2>/dev/null || echo "")
    if [ -n "$OLD_IMAGE" ]; then
        docker save "$OLD_IMAGE" -o "$BACKUP_FILE" 2>/dev/null && \
            log_success "Бэкап сохранен: $BACKUP_FILE" || \
            log_warning "Не удалось создать бэкап образа"
    fi
fi

# Деплой через docker-compose
if [ "$USE_COMPOSE" = true ]; then
    log_info "Использование docker-compose для деплоя..."
    
    # Определение команды docker-compose
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        log_error "docker-compose не найден"
        exit 1
    fi
    
    # Остановка и удаление старых контейнеров
    log_info "Остановка старых контейнеров..."
    $COMPOSE_CMD down 2>/dev/null || true
    
    # Сборка образа
    if [ "$SKIP_BUILD" = false ]; then
        log_info "Сборка образов через docker-compose..."
        if $COMPOSE_CMD build fllanding; then
            log_success "Образы успешно собраны"
        else
            log_error "Ошибка при сборке образов"
            exit 1
        fi
    else
        log_info "Пропуск сборки образов (--no-build)"
    fi
    
    # Запуск контейнеров
    log_info "Запуск контейнеров через docker-compose..."
    if $COMPOSE_CMD up -d; then
        log_success "Контейнеры успешно запущены"
    else
        log_error "Ошибка при запуске контейнеров"
        exit 1
    fi
    
    # Ожидание запуска контейнеров
    log_info "Ожидание запуска контейнеров..."
    sleep 5
    
    # Проверка статуса контейнеров
    log_info "Статус контейнеров:"
    $COMPOSE_CMD ps
    
    # Проверка здоровья приложения через nginx-proxy
    log_info "Проверка здоровья приложения..."
    if command -v curl &> /dev/null; then
        if curl -f -s -H "Host: arhipovdan.ru" "http://localhost" > /dev/null 2>&1; then
            log_success "Приложение отвечает через nginx-proxy"
        else
            log_warning "Приложение не отвечает через nginx-proxy (возможно, еще запускается)"
        fi
    else
        log_warning "curl не установлен, пропускаем проверку здоровья"
    fi
    
    # Итоговая информация для docker-compose
    echo ""
    log_success "Деплой завершен успешно!"
    echo ""
    echo -e "${CYAN}Информация о контейнерах:${NC}"
    $COMPOSE_CMD ps
    echo ""
    echo -e "${CYAN}Полезные команды:${NC}"
    echo "  Просмотр логов:    $COMPOSE_CMD logs -f fllanding"
    echo "  Логи nginx:        $COMPOSE_CMD logs -f nginx-proxy"
    echo "  Остановка:         $COMPOSE_CMD down"
    echo "  Перезапуск:        $COMPOSE_CMD restart fllanding"
    echo "  Статус:            $COMPOSE_CMD ps"
    echo ""
    echo -e "${GREEN}Сайт доступен по адресу: http://arhipovdan.ru${NC}"
    echo -e "${GREEN}Также доступен: http://nikitintex.ru${NC}"
    
else
    # Старый режим деплоя (без docker-compose)
    # Остановка и удаление старого контейнера
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Остановка старого контейнера..."
        docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
        log_success "Контейнер остановлен"
    fi

    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Удаление старого контейнера..."
        docker rm "$CONTAINER_NAME" > /dev/null 2>&1 || true
        log_success "Контейнер удален"
    fi

    # Сборка Docker образа
    if [ "$SKIP_BUILD" = false ]; then
        log_info "Сборка Docker образа '$IMAGE_NAME'..."
        if docker build -t "$IMAGE_NAME" .; then
            log_success "Образ успешно собран"
        else
            log_error "Ошибка при сборке образа"
            exit 1
        fi
    else
        log_info "Пропуск сборки образа (--no-build)"
        
        # Проверка наличия образа
        if ! docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "^${IMAGE_NAME}$"; then
            log_error "Образ '$IMAGE_NAME' не найден. Используйте --no-build только если образ уже собран."
            exit 1
        fi
    fi

    # Запуск нового контейнера
    log_info "Запуск нового контейнера на порту $PORT..."
    if docker run -d \
        --name "$CONTAINER_NAME" \
        -p "${PORT}:80" \
        --restart unless-stopped \
        "$IMAGE_NAME"; then
        log_success "Контейнер успешно запущен"
    else
        log_error "Ошибка при запуске контейнера"
        exit 1
    fi

    # Ожидание запуска контейнера
    log_info "Ожидание запуска контейнера..."
    sleep 3

    # Проверка статуса контейнера
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_success "Контейнер работает"
        
        # Проверка здоровья приложения
        log_info "Проверка здоровья приложения..."
        if command -v curl &> /dev/null; then
            if curl -f -s "http://localhost:${PORT}" > /dev/null 2>&1; then
                log_success "Приложение отвечает на http://localhost:${PORT}"
            else
                log_warning "Приложение не отвечает на http://localhost:${PORT} (возможно, еще запускается)"
            fi
        else
            log_warning "curl не установлен, пропускаем проверку здоровья"
        fi
    else
        log_error "Контейнер не запущен"
        log_info "Логи контейнера:"
        docker logs "$CONTAINER_NAME" 2>&1 | tail -20
        exit 1
    fi
    
    # Итоговая информация для обычного режима
    echo ""
    log_success "Деплой завершен успешно!"
    echo ""
    echo -e "${CYAN}Информация о контейнере:${NC}"
    docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo -e "${CYAN}Полезные команды:${NC}"
    echo "  Просмотр логов:    docker logs -f $CONTAINER_NAME"
    echo "  Остановка:         docker stop $CONTAINER_NAME"
    echo "  Перезапуск:        docker restart $CONTAINER_NAME"
    echo "  Статус:            docker ps --filter name=$CONTAINER_NAME"
    echo ""
    echo -e "${GREEN}Сайт доступен по адресу: http://localhost:${PORT}${NC}"
fi

# Очистка старых образов (опционально)
log_info "Очистка неиспользуемых образов..."
docker image prune -f > /dev/null 2>&1 || true

