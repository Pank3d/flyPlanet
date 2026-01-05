import TelegramBot from 'node-telegram-bot-api';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const SERVER_IP = process.env.SERVER_IP;
const PUBLIC_KEY = process.env.PUBLIC_KEY;

if (!BOT_TOKEN || !SERVER_IP || !PUBLIC_KEY) {
    console.error('Error: Missing required environment variables');
    console.error('Required: BOT_TOKEN, SERVER_IP, PUBLIC_KEY');
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const users = new Map();


const generateVlessLink = (uuid, username) => {
    const params = new URLSearchParams({
        type: 'tcp',
        security: 'reality',
        fp: 'chrome',
        pbk: PUBLIC_KEY,
        sni: 'yandex.ru',
        sid: '477b297f',
        spx: '/',
        flow: 'xtls-rprx-vision'
    });
    return `vless://${uuid}@${SERVER_IP}:443?${params}#${encodeURIComponent(username)}`;
};

const formatConfig = (uuid, link) => {
    return `*VLESS + REALITY Configuration*\n\n` +
        `*Server:* ${SERVER_IP}\n` +
        `*Port:* 443\n` +
        `*UUID:* \`${uuid}\`\n` +
        `*SNI:* yandex.ru\n` +
        `*Flow:* xtls-rprx-vision\n\n` +
        `*Connection Link:*\n\`${link}\`\n\n` +
        `*JSON Config:*\n\`\`\`json\n` +
        JSON.stringify({
            add: SERVER_IP,
            port: "443",
            id: uuid,
            net: "tcp",
            security: "reality",
            flow: "xtls-rprx-vision",
            sni: "yandex.ru",
            fp: "chrome",
            pbk: PUBLIC_KEY,
            sid: "477b297f"
        }, null, 2) +
        `\n\`\`\``;
};

bot.onText(/\/start/, async (msg) => {
    bot.sendMessage(msg.chat.id,
        `*Telegram Bot for VLESS + REALITY configs*\n\n` +
        `Your ID: \`${msg.from.id}\`\n\n` +
        `Use /config to get your configuration.`,
        { parse_mode: 'Markdown' });
});

const handleGetConfig = async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name || `User${userId}`;

    console.log(`Config request from ${username} (${userId})`);

    const statusMsg = await bot.sendMessage(chatId, 'Generating configuration...');

    try {
        let uuid = users.get(userId);
        if (!uuid) {
            uuid = uuidv4();
            users.set(userId, uuid);
            console.log(`New UUID ${uuid} for ${username}`);
        }

        const link = generateVlessLink(uuid, username);
        const qrBuffer = await QRCode.toBuffer(link);

        await bot.deleteMessage(chatId, statusMsg.message_id);

        await bot.sendPhoto(chatId, qrBuffer, {
            caption: formatConfig(uuid, link),
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'New UUID', callback_data: 'new_uuid' }]
                ]
            }
        });
    } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'Error generating config. Try again later.');
    }
};

bot.onText(/\/config/, handleGetConfig);

bot.onText(/\/info/, (msg) => {
    bot.sendMessage(msg.chat.id,
        `*Server Information*\n\n` +
        `*Server:* ${SERVER_IP}\n` +
        `*Port:* 443\n` +
        `*SNI:* yandex.ru\n` +
        `*Protocol:* VLESS + REALITY\n` +
        `*Flow:* xtls-rprx-vision`,
        { parse_mode: 'Markdown' });
});

bot.onText(/\/stats/, (msg) => {
    bot.sendMessage(msg.chat.id,
        `*Statistics*\n\n` +
        `*Total Users:* ${users.size}\n` +
        `*Configs Issued:* ${users.size}\n` +
        `*Server:* ${SERVER_IP}`,
        { parse_mode: 'Markdown' });
});

bot.on('callback_query', async (query) => {
    if (query.data === 'new_uuid') {
        const userId = query.from.id;
        const newUuid = uuidv4();
        users.set(userId, newUuid);
        console.log(`New UUID for ${userId}: ${newUuid}`);

        await bot.answerCallbackQuery(query.id, { text: 'Generating new UUID...' });
        await handleGetConfig({ chat: { id: query.message.chat.id }, from: query.from });
    }
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

console.log('Bot ready');
