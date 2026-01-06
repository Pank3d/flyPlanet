#!/bin/bash

echo "=== Checking REALITY Traffic Masking ==="
echo ""
echo "This script will capture traffic on port 443 and analyze SNI (Server Name Indication)"
echo "to verify that REALITY is properly masking traffic as yandex.ru"
echo ""

# Проверяем что tcpdump установлен
if ! command -v tcpdump &> /dev/null; then
    echo "Installing tcpdump..."
    apt-get update -qq && apt-get install -y tcpdump
fi

echo "=== Starting packet capture on port 443 ==="
echo "Press Ctrl+C to stop after you see some traffic"
echo ""
echo "What to look for:"
echo "  ✅ GOOD: SNI shows 'yandex.ru' - traffic is masked"
echo "  ❌ BAD: SNI shows other domains or no SNI - traffic is NOT masked"
echo ""

# Захватываем пакеты и ищем SNI
# -i any: все интерфейсы
# -nn: не резолвить имена
# port 443: только HTTPS трафик
# -A: ASCII вывод для поиска SNI
# -s0: захватывать весь пакет
sudo timeout 30 tcpdump -i any -nn -A -s0 'tcp port 443 and (tcp[((tcp[12] & 0xf0) >> 2)] = 0x16)' 2>/dev/null | grep -i --line-buffered -E "yandex|SNI|Server Name" || echo "No SNI data captured in 30 seconds"

echo ""
echo ""
echo "=== Alternative method: Check with tshark (more detailed) ==="

if command -v tshark &> /dev/null; then
    echo "Capturing 20 packets on port 443..."
    sudo timeout 10 tshark -i any -f "tcp port 443" -Y "ssl.handshake.type == 1" -T fields -e ip.src -e ip.dst -e ssl.handshake.extensions_server_name 2>/dev/null | head -20
else
    echo "tshark not installed. Install with: apt-get install tshark"
fi

echo ""
echo "=== Manual verification method ==="
echo ""
echo "1. On your phone/computer, connect to VPN"
echo "2. On VPS, run this command:"
echo "   sudo tcpdump -i any -nn -X 'port 443' | grep -A5 -B5 yandex"
echo ""
echo "3. Open any website on your phone"
echo "4. Check if you see 'yandex.ru' in the output"
echo ""
echo "If you see yandex.ru in SNI → REALITY masking works ✅"
echo "If you don't see yandex.ru → REALITY is NOT working ❌"
