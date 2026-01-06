#!/bin/bash

echo "=== Enabling Xray debug logging ==="

# Создаем директорию для логов
sudo mkdir -p /var/log/xray
sudo chmod 755 /var/log/xray

# Создаем backup текущего конфига
sudo cp /usr/local/etc/xray/config.json /usr/local/etc/xray/config.json.backup

# Проверяем текущий конфиг
echo ""
echo "=== Current log config ==="
sudo cat /usr/local/etc/xray/config.json | grep -A5 '"log"' || echo "No log section found"

# Читаем текущий конфиг
CONFIG=$(sudo cat /usr/local/etc/xray/config.json)

# Проверяем есть ли уже секция log
if echo "$CONFIG" | grep -q '"log"'; then
  echo ""
  echo "Log section exists, updating..."
  # Заменяем существующую секцию log
  sudo bash -c 'cat > /usr/local/etc/xray/config.json' << 'EOF'
{
  "log": {
    "loglevel": "debug",
    "access": "/var/log/xray/access.log",
    "error": "/var/log/xray/error.log"
  },
  "inbounds": [
    {
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "eeedbbfb-dd01-4c3e-8df3-59beef88159d",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "yandex.ru:443",
          "xver": 0,
          "serverNames": ["yandex.ru"],
          "privateKey": "0KM5_oDEJLnMPBW8-x_OmMZnDhzBOY2KR-sjGtcB80o",
          "shortIds": ["32a85df6"]
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    }
  ]
}
EOF
else
  echo ""
  echo "ERROR: No log section found in config!"
  exit 1
fi

# Проверяем новый конфиг
echo ""
echo "=== New config ==="
sudo cat /usr/local/etc/xray/config.json | grep -A5 '"log"'

# Создаем файлы логов с правильными правами
sudo touch /var/log/xray/access.log /var/log/xray/error.log
sudo chmod 644 /var/log/xray/access.log /var/log/xray/error.log

# Проверяем конфиг на ошибки
echo ""
echo "=== Testing config ==="
sudo xray run -test -config /usr/local/etc/xray/config.json

# Перезапускаем Xray
echo ""
echo "=== Restarting Xray ==="
sudo systemctl restart xray

# Ждем 2 секунды
sleep 2

# Проверяем статус
echo ""
echo "=== Xray Status ==="
sudo systemctl status xray --no-pager

# Проверяем что файлы логов создались
echo ""
echo "=== Log files ==="
sudo ls -lah /var/log/xray/

echo ""
echo "=== Logging enabled! ==="
echo "Now you can monitor logs with:"
echo "  sudo tail -f /var/log/xray/access.log"
echo "  sudo tail -f /var/log/xray/error.log"
echo ""
echo "Or both at once:"
echo "  sudo tail -f /var/log/xray/access.log /var/log/xray/error.log"
