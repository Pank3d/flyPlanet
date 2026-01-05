#!/usr/bin/env python3
"""
VLESS + REALITY автоматический деплойер
Автоматически разворачивает и настраивает Xray с REALITY на вашем сервере
"""

import argparse
import subprocess
import json
import uuid
import base64
import os
from pathlib import Path

class RealityDeployer:
    def __init__(self, host, port=22, user="root", password=None, key_file=None):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.key_file = key_file
        self.config = {}

    def ssh_command(self, command):
        """Выполнить SSH команду на удаленном сервере"""
        if self.key_file:
            ssh_cmd = f'ssh -i {self.key_file} -p {self.port} {self.user}@{self.host} "{command}"'
        else:
            # Для Windows можно использовать plink из PuTTY
            ssh_cmd = f'plink -P {self.port} {self.user}@{self.host} -pw {self.password} "{command}"'

        print(f"[CMD] {command}")
        try:
            result = subprocess.run(ssh_cmd, shell=True, capture_output=True, text=True)
            return result.stdout, result.returncode
        except Exception as e:
            print(f"[ERROR] {e}")
            return None, 1

    def scp_file(self, local_file, remote_file):
        """Скопировать файл на удаленный сервер"""
        if self.key_file:
            scp_cmd = f'scp -i {self.key_file} -P {self.port} {local_file} {self.user}@{self.host}:{remote_file}'
        else:
            scp_cmd = f'pscp -P {self.port} -pw {self.password} {local_file} {self.user}@{self.host}:{remote_file}'

        print(f"[UPLOAD] {local_file} -> {remote_file}")
        try:
            result = subprocess.run(scp_cmd, shell=True)
            return result.returncode == 0
        except Exception as e:
            print(f"[ERROR] {e}")
            return False

    def generate_uuid(self):
        """Генерация UUID для пользователя"""
        return str(uuid.uuid4())

    def generate_x25519_keys(self):
        """Генерация пары ключей X25519"""
        print("[INFO] Генерация X25519 ключей...")

        # Генерируем на сервере
        output, code = self.ssh_command("xray x25519")

        if code == 0 and output:
            lines = output.strip().split('\n')
            private_key = None
            public_key = None

            for line in lines:
                if 'Private key:' in line:
                    private_key = line.split('Private key:')[1].strip()
                elif 'Public key:' in line:
                    public_key = line.split('Public key:')[1].strip()

            if private_key and public_key:
                print(f"[OK] Private key: {private_key}")
                print(f"[OK] Public key: {public_key}")
                return private_key, public_key

        print("[ERROR] Не удалось сгенерировать ключи")
        return None, None

    def install_xray(self):
        """Установка Xray на сервер"""
        print("\n[STEP 1] Установка Xray-core...")

        # Проверяем, установлен ли уже Xray
        output, code = self.ssh_command("which xray")
        if code == 0 and output.strip():
            print("[OK] Xray уже установлен")
            return True

        # Установка Xray
        install_cmd = 'bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install'
        output, code = self.ssh_command(install_cmd)

        if code == 0:
            print("[OK] Xray успешно установлен")
            return True
        else:
            print("[ERROR] Ошибка установки Xray")
            return False

    def configure_firewall(self):
        """Настройка фаерволла"""
        print("\n[STEP 2] Настройка фаерволла...")

        # Проверяем UFW
        output, code = self.ssh_command("which ufw")
        if code == 0 and output.strip():
            self.ssh_command("ufw allow 443/tcp")
            self.ssh_command("echo 'y' | ufw enable")
            print("[OK] UFW настроен")
        else:
            # iptables как запасной вариант
            self.ssh_command("iptables -A INPUT -p tcp --dport 443 -j ACCEPT")
            self.ssh_command("iptables-save > /etc/iptables/rules.v4")
            print("[OK] iptables настроен")

        return True

    def create_config(self, user_id, private_key, dest_domain="yandex.ru", server_names=None):
        """Создание конфигурации сервера"""
        print("\n[STEP 3] Создание конфигурации...")

        if server_names is None:
            server_names = ["yandex.ru", "ya.ru", "disk.yandex.ru"]

        config = {
            "log": {
                "loglevel": "warning"
            },
            "inbounds": [
                {
                    "port": 443,
                    "protocol": "vless",
                    "settings": {
                        "clients": [
                            {
                                "id": user_id,
                                "flow": "xtls-rprx-vision"
                            }
                        ],
                        "decryption": "none"
                    },
                    "streamSettings": {
                        "network": "tcp",
                        "security": "reality",
                        "realitySettings": {
                            "show": False,
                            "dest": f"{dest_domain}:443",
                            "xver": 0,
                            "serverNames": server_names,
                            "privateKey": private_key,
                            "shortIds": [
                                "",
                                "477b297f"
                            ]
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

        self.config = config
        return config

    def deploy_config(self):
        """Развертывание конфигурации на сервере"""
        print("\n[STEP 4] Развертывание конфигурации...")

        # Сохраняем конфиг локально
        config_file = "xray_config.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)

        # Копируем на сервер
        if self.scp_file(config_file, "/usr/local/etc/xray/config.json"):
            print("[OK] Конфигурация загружена")
            os.remove(config_file)
        else:
            print("[ERROR] Не удалось загрузить конфигурацию")
            return False

        # Проверяем конфигурацию
        output, code = self.ssh_command("xray run -test -c /usr/local/etc/xray/config.json")
        if code == 0:
            print("[OK] Конфигурация валидна")
        else:
            print("[ERROR] Конфигурация содержит ошибки:")
            print(output)
            return False

        return True

    def start_xray(self):
        """Запуск Xray сервиса"""
        print("\n[STEP 5] Запуск Xray...")

        # Перезапускаем сервис
        self.ssh_command("systemctl restart xray")
        self.ssh_command("systemctl enable xray")

        # Проверяем статус
        output, code = self.ssh_command("systemctl is-active xray")
        if code == 0 and "active" in output:
            print("[OK] Xray запущен и работает")
            return True
        else:
            print("[ERROR] Xray не запустился")
            print("[INFO] Проверьте логи: journalctl -u xray -n 50")
            return False

    def generate_client_link(self, user_id, public_key, server_name="yandex.ru", alias="My-REALITY"):
        """Генерация клиентской ссылки"""
        params = {
            "type": "tcp",
            "security": "reality",
            "fp": "chrome",
            "pbk": public_key,
            "sni": server_name,
            "sid": "477b297f",
            "spx": "/",
            "flow": "xtls-rprx-vision"
        }

        param_str = "&".join([f"{k}={v}" for k, v in params.items()])
        link = f"vless://{user_id}@{self.host}:443?{param_str}#{alias}"

        return link

    def deploy(self, dest_domain="yandex.ru", server_names=None, alias="Reality-Server"):
        """Полное развертывание"""
        print("=" * 80)
        print("VLESS + REALITY Автоматический деплой")
        print("=" * 80)
        print(f"Сервер: {self.host}")
        print(f"Домен маскировки: {dest_domain}")
        print("=" * 80)

        # Шаг 1: Установка Xray
        if not self.install_xray():
            return False

        # Шаг 2: Настройка фаерволла
        if not self.configure_firewall():
            return False

        # Генерация UUID и ключей
        user_id = self.generate_uuid()
        print(f"\n[INFO] UUID пользователя: {user_id}")

        private_key, public_key = self.generate_x25519_keys()
        if not private_key or not public_key:
            return False

        # Шаг 3: Создание конфигурации
        self.create_config(user_id, private_key, dest_domain, server_names)

        # Шаг 4: Развертывание
        if not self.deploy_config():
            return False

        # Шаг 5: Запуск
        if not self.start_xray():
            return False

        # Генерация клиентской ссылки
        print("\n" + "=" * 80)
        print("РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО!")
        print("=" * 80)

        client_link = self.generate_client_link(user_id, public_key,
                                                 server_names[0] if server_names else dest_domain,
                                                 alias)

        print(f"\nВаша клиентская ссылка:\n")
        print(client_link)
        print("\n" + "=" * 80)

        # Сохраняем информацию
        info = {
            "server": self.host,
            "uuid": user_id,
            "public_key": public_key,
            "private_key": private_key,
            "dest_domain": dest_domain,
            "server_names": server_names if server_names else [dest_domain],
            "client_link": client_link
        }

        with open("reality_server_info.json", 'w', encoding='utf-8') as f:
            json.dump(info, f, indent=2, ensure_ascii=False)

        print("\nИнформация сохранена в: reality_server_info.json")
        print("Используйте эту ссылку в v2rayN, v2rayNG, Nekoray или другом клиенте")
        print("=" * 80)

        return True


def main():
    parser = argparse.ArgumentParser(description='VLESS + REALITY автоматический деплойер')

    parser.add_argument('--host', required=True, help='IP адрес сервера')
    parser.add_argument('--port', type=int, default=22, help='SSH порт (по умолчанию: 22)')
    parser.add_argument('--user', default='root', help='SSH пользователь (по умолчанию: root)')
    parser.add_argument('--password', help='SSH пароль')
    parser.add_argument('--key', help='Путь к SSH ключу')
    parser.add_argument('--dest', default='yandex.ru',
                        help='Домен для маскировки (по умолчанию: yandex.ru)')
    parser.add_argument('--sni', nargs='+',
                        help='Список SNI доменов (по умолчанию: yandex.ru ya.ru)')
    parser.add_argument('--alias', default='Reality-Server',
                        help='Название конфигурации')

    args = parser.parse_args()

    if not args.password and not args.key:
        print("Ошибка: Необходимо указать --password или --key")
        return

    server_names = args.sni if args.sni else ["yandex.ru", "ya.ru", "disk.yandex.ru"]

    deployer = RealityDeployer(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password,
        key_file=args.key
    )

    deployer.deploy(
        dest_domain=args.dest,
        server_names=server_names,
        alias=args.alias
    )


if __name__ == "__main__":
    main()
