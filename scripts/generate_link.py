#!/usr/bin/env python3
"""
Генератор клиентских ссылок для REALITY
"""

import argparse
import uuid
import json
from urllib.parse import quote

def generate_vless_link(server_ip, port, user_id, public_key, sni, short_id="477b297f",
                        flow="xtls-rprx-vision", fp="chrome", alias="Reality"):
    """Генерирует VLESS ссылку для REALITY"""

    params = {
        "type": "tcp",
        "security": "reality",
        "fp": fp,
        "pbk": public_key,
        "sni": sni,
        "sid": short_id,
        "spx": "/",
        "flow": flow
    }

    param_str = "&".join([f"{k}={v}" for k, v in params.items()])
    link = f"vless://{user_id}@{server_ip}:{port}?{param_str}#{quote(alias)}"

    return link


def parse_existing_link(link):
    """Парсит существующую VLESS ссылку"""
    try:
        # Убираем префикс vless://
        if not link.startswith("vless://"):
            return None

        link = link[8:]  # Убираем "vless://"

        # Разделяем на части
        if "#" in link:
            link, alias = link.split("#", 1)
        else:
            alias = "Unknown"

        if "?" in link:
            address_part, params_part = link.split("?", 1)
        else:
            return None

        # Парсим адрес
        user_id, server = address_part.split("@", 1)
        server_ip, port = server.split(":", 1)

        # Парсим параметры
        params = {}
        for param in params_part.split("&"):
            if "=" in param:
                key, value = param.split("=", 1)
                params[key] = value

        return {
            "user_id": user_id,
            "server_ip": server_ip,
            "port": port,
            "public_key": params.get("pbk", ""),
            "sni": params.get("sni", ""),
            "short_id": params.get("sid", ""),
            "flow": params.get("flow", "xtls-rprx-vision"),
            "fp": params.get("fp", "chrome"),
            "alias": alias
        }
    except Exception as e:
        print(f"Ошибка парсинга: {e}")
        return None


def print_link_info(info):
    """Выводит информацию о ссылке"""
    print("=" * 80)
    print("ИНФОРМАЦИЯ О КОНФИГУРАЦИИ")
    print("=" * 80)
    print(f"Сервер:        {info['server_ip']}:{info['port']}")
    print(f"UUID:          {info['user_id']}")
    print(f"Public Key:    {info['public_key']}")
    print(f"SNI:           {info['sni']}")
    print(f"Short ID:      {info['short_id']}")
    print(f"Flow:          {info['flow']}")
    print(f"Fingerprint:   {info['fp']}")
    print(f"Название:      {info['alias']}")
    print("=" * 80)


def main():
    parser = argparse.ArgumentParser(description='Генератор VLESS ссылок для REALITY')

    subparsers = parser.add_subparsers(dest='command', help='Команды')

    # Команда generate
    gen_parser = subparsers.add_parser('generate', help='Сгенерировать новую ссылку')
    gen_parser.add_argument('--server', required=True, help='IP адрес сервера')
    gen_parser.add_argument('--port', type=int, default=443, help='Порт (по умолчанию: 443)')
    gen_parser.add_argument('--uuid', help='UUID пользователя (сгенерируется автоматически если не указан)')
    gen_parser.add_argument('--pubkey', required=True, help='Публичный ключ X25519')
    gen_parser.add_argument('--sni', default='yandex.ru', help='SNI домен (по умолчанию: yandex.ru)')
    gen_parser.add_argument('--sid', default='477b297f', help='Short ID')
    gen_parser.add_argument('--flow', default='xtls-rprx-vision', help='Flow control')
    gen_parser.add_argument('--fp', default='chrome', help='Fingerprint (chrome, firefox, safari, edge)')
    gen_parser.add_argument('--alias', default='Reality', help='Название конфигурации')

    # Команда parse
    parse_parser = subparsers.add_parser('parse', help='Разобрать существующую ссылку')
    parse_parser.add_argument('link', help='VLESS ссылка для разбора')

    # Команда batch
    batch_parser = subparsers.add_parser('batch', help='Создать несколько ссылок')
    batch_parser.add_argument('--server', required=True, help='IP адрес сервера')
    batch_parser.add_argument('--pubkey', required=True, help='Публичный ключ X25519')
    batch_parser.add_argument('--count', type=int, default=5, help='Количество пользователей')
    batch_parser.add_argument('--sni', default='yandex.ru', help='SNI домен')

    args = parser.parse_args()

    if args.command == 'generate':
        user_id = args.uuid if args.uuid else str(uuid.uuid4())

        link = generate_vless_link(
            server_ip=args.server,
            port=args.port,
            user_id=user_id,
            public_key=args.pubkey,
            sni=args.sni,
            short_id=args.sid,
            flow=args.flow,
            fp=args.fp,
            alias=args.alias
        )

        print("\n" + "=" * 80)
        print("СГЕНЕРИРОВАННАЯ ССЫЛКА")
        print("=" * 80)
        print(link)
        print("=" * 80)

        print("\nИнформация:")
        print(f"UUID: {user_id}")
        print(f"Сервер: {args.server}:{args.port}")
        print(f"SNI: {args.sni}")

    elif args.command == 'parse':
        info = parse_existing_link(args.link)
        if info:
            print_link_info(info)

            # Пример конфигурации для клиента
            print("\nJSON конфигурация для импорта:")
            config = {
                "v": "2",
                "ps": info['alias'],
                "add": info['server_ip'],
                "port": info['port'],
                "id": info['user_id'],
                "net": "tcp",
                "type": "none",
                "security": "reality",
                "flow": info['flow'],
                "sni": info['sni'],
                "fp": info['fp'],
                "pbk": info['public_key'],
                "sid": info['short_id'],
                "spx": "/"
            }
            print(json.dumps(config, indent=2, ensure_ascii=False))
        else:
            print("Не удалось разобрать ссылку")

    elif args.command == 'batch':
        print(f"\n" + "=" * 80)
        print(f"ГЕНЕРАЦИЯ {args.count} ПОЛЬЗОВАТЕЛЕЙ")
        print("=" * 80)

        users = []
        for i in range(1, args.count + 1):
            user_id = str(uuid.uuid4())
            link = generate_vless_link(
                server_ip=args.server,
                port=443,
                user_id=user_id,
                public_key=args.pubkey,
                sni=args.sni,
                alias=f"User-{i}"
            )

            users.append({
                "user_id": user_id,
                "link": link,
                "name": f"User-{i}"
            })

            print(f"\n[User {i}]")
            print(f"UUID: {user_id}")
            print(f"Link: {link}")

        # Сохраняем в файл
        with open("users_batch.json", 'w', encoding='utf-8') as f:
            json.dump(users, f, indent=2, ensure_ascii=False)

        print("\n" + "=" * 80)
        print("Все пользователи сохранены в: users_batch.json")
        print("=" * 80)

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
