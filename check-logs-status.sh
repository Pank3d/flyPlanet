#!/bin/bash

echo "=== Checking log directory and files ==="
sudo ls -lah /var/log/xray/

echo ""
echo "=== Checking if log files exist and their sizes ==="
if [ -f /var/log/xray/access.log ]; then
  echo "access.log exists:"
  sudo wc -l /var/log/xray/access.log
  echo "Last 10 lines:"
  sudo tail -10 /var/log/xray/access.log
else
  echo "access.log does NOT exist!"
fi

echo ""
if [ -f /var/log/xray/error.log ]; then
  echo "error.log exists:"
  sudo wc -l /var/log/xray/error.log
  echo "Last 10 lines:"
  sudo tail -10 /var/log/xray/error.log
else
  echo "error.log does NOT exist!"
fi

echo ""
echo "=== Checking Xray process and user ==="
ps aux | grep -v grep | grep xray

echo ""
echo "=== Checking Xray service status ==="
sudo systemctl status xray --no-pager

echo ""
echo "=== Recent Xray journalctl logs ==="
sudo journalctl -u xray -n 30 --no-pager
