#!/bin/bash
echo "=== Checking Xray config ==="
cat /usr/local/etc/xray/config.json | grep -A5 '"log"'

echo ""
echo "=== Checking log directory ==="
ls -la /var/log/xray/

echo ""
echo "=== Checking Xray service status ==="
systemctl status xray --no-pager

echo ""
echo "=== Checking recent Xray logs from journalctl ==="
journalctl -u xray -n 20 --no-pager
