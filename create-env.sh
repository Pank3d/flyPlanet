#!/bin/bash

# Скрипт для создания .env файла из server info на VPS

set -e

echo "=== Creating .env file from server info ==="

# Проверяем наличие файла с информацией о сервере
if [ ! -f ~/xray-info/reality_server_info.json ]; then
    echo "ERROR: File ~/xray-info/reality_server_info.json not found!"
    echo "Please deploy Xray server first."
    exit 1
fi

# Проверяем что BOT_TOKEN передан как аргумент или существует в окружении
if [ -z "$BOT_TOKEN" ] && [ -z "$1" ]; then
    echo "ERROR: BOT_TOKEN is required!"
    echo "Usage: $0 <BOT_TOKEN>"
    echo "   or: BOT_TOKEN=xxx $0"
    exit 1
fi

# Используем BOT_TOKEN из аргумента если передан
if [ -n "$1" ]; then
    BOT_TOKEN="$1"
fi

# Извлекаем данные из JSON
PUBLIC_KEY=$(cat ~/xray-info/reality_server_info.json | grep -o '"public_key":"[^"]*"' | cut -d'"' -f4)
SERVER_IP=$(cat ~/xray-info/reality_server_info.json | grep -o '"server":"[^"]*"' | cut -d'"' -f4)
SHORT_ID=$(cat ~/xray-info/reality_server_info.json | grep -o '"short_id":"[^"]*"' | cut -d'"' -f4)

# Проверяем что все значения получены
if [ -z "$PUBLIC_KEY" ]; then
    echo "ERROR: Failed to extract PUBLIC_KEY"
    exit 1
fi

if [ -z "$SERVER_IP" ]; then
    echo "ERROR: Failed to extract SERVER_IP"
    exit 1
fi

if [ -z "$SHORT_ID" ]; then
    echo "ERROR: Failed to extract SHORT_ID"
    exit 1
fi

# Переходим в директорию проекта
cd ~/vless-reality-project

# Создаем .env файл
echo "BOT_TOKEN=${BOT_TOKEN}" > .env
echo "SERVER_IP=${SERVER_IP}" >> .env
echo "PUBLIC_KEY=${PUBLIC_KEY}" >> .env
echo "SHORT_ID=${SHORT_ID}" >> .env

echo ""
echo "=== .env file created successfully ==="
echo "Location: ~/vless-reality-project/.env"
echo ""
echo "Configuration:"
echo "  BOT_TOKEN: ${BOT_TOKEN:0:10}..."
echo "  SERVER_IP: $SERVER_IP"
echo "  PUBLIC_KEY: ${PUBLIC_KEY:0:20}..."
echo "  SHORT_ID: $SHORT_ID"
echo ""
echo "You can now run: docker compose up -d --build"
