#!/bin/bash

echo "=== Simulation of Total Internet Censorship ==="
echo "Blocking ALL traffic except Yandex (like real jamming)"
echo ""

case "$1" in
  enable)
    echo "Enabling TOTAL blocking simulation..."
    echo ""
    echo "Allowed ONLY:"
    echo "  ✓ Yandex (77.88.0.0/16, 87.250.0.0/16, 93.158.0.0/16, 213.180.0.0/16)"
    echo "  ✓ DNS (8.8.8.8, 1.1.1.1) - для работы системы"
    echo "  ✓ Localhost (127.0.0.0/8)"
    echo ""
    echo "Blocked:"
    echo "  ❌ ALL other traffic (Google, Facebook, WhatsApp, etc)"
    echo ""

    # Очищаем старые правила
    sudo iptables -F OUTPUT 2>/dev/null || true

    # Разрешаем localhost
    sudo iptables -A OUTPUT -d 127.0.0.0/8 -j ACCEPT

    # Разрешаем Яндекс IP диапазоны
    sudo iptables -A OUTPUT -d 77.88.0.0/16 -j ACCEPT      # Яндекс основной
    sudo iptables -A OUTPUT -d 87.250.0.0/16 -j ACCEPT     # Яндекс CDN
    sudo iptables -A OUTPUT -d 93.158.0.0/16 -j ACCEPT     # Яндекс дополнительный
    sudo iptables -A OUTPUT -d 213.180.0.0/16 -j ACCEPT    # Яндекс дополнительный
    sudo iptables -A OUTPUT -d 5.255.255.0/24 -j ACCEPT    # Яндекс DNS

    # Разрешаем DNS серверы (для резолва доменов)
    sudo iptables -A OUTPUT -d 8.8.8.8 -p udp --dport 53 -j ACCEPT
    sudo iptables -A OUTPUT -d 1.1.1.1 -p udp --dport 53 -j ACCEPT

    # Разрешаем входящие соединения (чтобы VPN клиенты могли подключиться)
    sudo iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

    # БЛОКИРУЕМ ВСЁ ОСТАЛЬНОЕ
    sudo iptables -A OUTPUT -j DROP

    echo "✓ Total blocking enabled!"
    echo ""
    echo "Active rules:"
    sudo iptables -L OUTPUT -n -v
    echo ""
    echo "Now only Yandex is accessible from VPS"
    echo "Test with: sudo bash simulate-blocking.sh test"
    echo "To disable: sudo bash simulate-blocking.sh disable"
    ;;

  disable)
    echo "Disabling blocking simulation..."
    echo ""

    # Очищаем все правила OUTPUT
    sudo iptables -F OUTPUT

    # Возвращаем политику по умолчанию
    sudo iptables -P OUTPUT ACCEPT

    echo "✓ Blocking disabled!"
    echo ""
    echo "All traffic is now allowed"
    ;;

  status)
    echo "Current blocking status:"
    echo ""
    sudo iptables -L OUTPUT -n -v
    echo ""
    TOTAL_RULES=$(sudo iptables -L OUTPUT -n | grep -c "^")
    echo "Total rules: $TOTAL_RULES"
    ;;

  test)
    echo "Testing connectivity with blocking enabled..."
    echo ""

    echo "1. Testing Yandex (SHOULD WORK ✓):"
    timeout 5 curl -I https://yandex.ru 2>&1 | head -1 || echo "   ❌ Yandex blocked (unexpected!)"

    echo ""
    echo "2. Testing Google (SHOULD BE BLOCKED ❌):"
    timeout 5 curl -I https://google.com 2>&1 | head -1 || echo "   ✓ Google blocked as expected"

    echo ""
    echo "3. Testing WhatsApp (SHOULD BE BLOCKED ❌):"
    timeout 5 curl -I https://v.whatsapp.net 2>&1 | head -1 || echo "   ✓ WhatsApp blocked as expected"

    echo ""
    echo "4. Testing Facebook (SHOULD BE BLOCKED ❌):"
    timeout 5 curl -I https://facebook.com 2>&1 | head -1 || echo "   ✓ Facebook blocked as expected"

    echo ""
    echo "5. Testing Cloudflare (SHOULD BE BLOCKED ❌):"
    timeout 5 curl -I https://cloudflare.com 2>&1 | head -1 || echo "   ✓ Cloudflare blocked as expected"

    echo ""
    echo "6. Testing DNS resolution:"
    nslookup google.com 2>&1 | grep -q "Address" && echo "   ✓ DNS works" || echo "   ❌ DNS broken"

    echo ""
    echo "=== Summary ==="
    echo "If only Yandex works - simulation is correct!"
    echo "Check Xray logs: sudo tail -20 /var/log/xray/error.log"
    ;;

  *)
    echo "Usage: $0 {enable|disable|status|test}"
    echo ""
    echo "Commands:"
    echo "  enable  - Block ALL traffic except Yandex (total censorship simulation)"
    echo "  disable - Remove all blocking (allow all traffic)"
    echo "  status  - Show current iptables rules"
    echo "  test    - Test connectivity to various services"
    echo ""
    echo "Example workflow:"
    echo "  1. sudo bash simulate-blocking.sh enable"
    echo "  2. Connect to VPN from phone"
    echo "  3. Try to open Google, WhatsApp, etc (should fail)"
    echo "  4. Try to open Yandex (should work)"
    echo "  5. Check Xray logs: sudo tail -f /var/log/xray/error.log"
    echo "  6. sudo bash simulate-blocking.sh disable"
    exit 1
    ;;
esac
