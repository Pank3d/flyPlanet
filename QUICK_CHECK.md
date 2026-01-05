# Быстрая проверка статуса бота

## Проверить запущен ли бот на VPS

```bash
# Подключитесь к серверу
ssh root@ВАШ_IP

# Проверьте статус Docker контейнера
cd ~/vless-reality-project
docker-compose ps

# Должно показать:
# NAME                  STATUS
# vless-reality-bot     Up X minutes
```

## Посмотреть логи

```bash
# Подключитесь к серверу
ssh root@ВАШ_IP

cd ~/vless-reality-project

# Последние 50 строк
docker-compose logs --tail=50 bot

# В реальном времени
docker-compose logs -f bot
```

## Перезапустить бота

```bash
ssh root@ВАШ_IP
cd ~/vless-reality-project
docker-compose restart bot
```

## Полная перезагрузка

```bash
ssh root@ВАШ_IP
cd ~/vless-reality-project
docker-compose down
docker-compose up -d --build
```

## Проверить что Xray работает

```bash
ssh root@ВАШ_IP
systemctl status xray
```

## Одна команда для полной проверки

```bash
ssh root@ВАШ_IP "cd ~/vless-reality-project && echo '=== Docker Status ===' && docker-compose ps && echo '' && echo '=== Bot Logs ===' && docker-compose logs --tail=20 bot && echo '' && echo '=== Xray Status ===' && systemctl status xray | grep Active"
```

## Тест бота в Telegram

1. Откройте Telegram
2. Найдите вашего бота
3. Отправьте `/start`
4. Если отвечает - все работает!
