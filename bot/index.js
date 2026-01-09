import TelegramBot from 'node-telegram-bot-api';
import QRCode from 'qrcode';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const SERVER_IP = process.env.SERVER_IP;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const SHORT_ID = process.env.SHORT_ID || 'be0a50b4';
const SERVER_UUID = process.env.SERVER_UUID;  // UUID с сервера

if (!BOT_TOKEN || !SERVER_IP || !PUBLIC_KEY || !SERVER_UUID) {
    console.error('Error: Missing required environment variables');
    console.error('Required: BOT_TOKEN, SERVER_IP, PUBLIC_KEY, SHORT_ID, SERVER_UUID');
    process.exit(1);
}

console.log('Bot configuration:');
console.log('- SERVER_IP:', SERVER_IP);
console.log('- PUBLIC_KEY:', PUBLIC_KEY.substring(0, 20) + '...');
console.log('- SHORT_ID:', SHORT_ID);
console.log('- SERVER_UUID:', SERVER_UUID);

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const users = new Map();

// Профили для разных операторов (только российские SNI)
const operatorProfiles = [
    {
        port: 443,
        sni: "yandex.ru",
        shortId: "a1b2c3d4",
        name: "Yandex",
        comment: "Универсальный, работает с Tele2, Билайн"
    },
    {
        port: 8443,
        sni: "vk.com",
        shortId: "e5f6g7h8",
        name: "VK",
        comment: "Хорошо для МТС, Билайн"
    },
    {
        port: 2053,
        sni: "mail.ru",
        shortId: "i9j0k1l2",
        name: "Mail.ru",
        comment: "Альтернатива для Билайн, Tele2"
    },
    {
        port: 2083,
        sni: "ok.ru",
        shortId: "m3n4o5p6",
        name: "OK.ru",
        comment: "Для Мегафон, МТС"
    },
    {
        port: 2087,
        sni: "rutube.ru",
        shortId: "q7r8s9t0",
        name: "RuTube",
        comment: "Альтернативный порт для всех операторов"
    }
];


const generateVlessLink = (uuid, username, profile) => {
    // Создаем название конфигурации с операторами
    // Берем часть после " - " из комментария (например: "работает с Tele2, Билайн")
    const operatorsPart = profile.comment.split(' - ')[1] || profile.comment;
    // Убираем лишние слова, оставляем только операторов
    const operators = operatorsPart.replace(/универсальный,?\s?/gi, '')
                                   .replace(/работает с\s?/gi, '')
                                   .replace(/хорошо для\s?/gi, '')
                                   .replace(/для\s?/gi, '')
                                   .replace(/альтернатива для\s?/gi, '')
                                   .replace(/альтернативный порт для всех операторов/gi, 'Все операторы')
                                   .replace(/стабильно работает на всех операторах/gi, 'Все операторы')
                                   .trim();

    const configName = operators;

    const params = new URLSearchParams({
        type: 'tcp',
        security: 'reality',
        fp: 'chrome',
        pbk: PUBLIC_KEY,
        sni: profile.sni,
        sid: profile.shortId,
        spx: '/',
        flow: 'xtls-rprx-vision'
    });
    return `vless://${uuid}@${SERVER_IP}:${profile.port}?${params}#${encodeURIComponent(configName)}`;
};

const generateAllVlessLinks = (uuid) => {
    return operatorProfiles.map(profile => ({
        name: profile.name,
        comment: profile.comment,
        port: profile.port,
        sni: profile.sni,
        link: generateVlessLink(uuid, profile.name, profile)
    }));
};

const formatConfigForOperator = (uuid, profileData) => {
    return `*${profileData.name}*\n\n` +
        `\`${profileData.link}\``;
};

const formatAllConfigs = (profiles) => {
    let message = `*📱 Выберите конфигурацию для вашего оператора:*\n\n`;

    profiles.forEach((profile, index) => {
        message += `*${index + 1}. ${profile.name}*\n`;
        message += `${profile.comment}\n\n`;
    });

    return message;
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

    const statusMsg = await bot.sendMessage(chatId, 'Generating configurations...');

    try {
        // Используем UUID с сервера для всех пользователей
        const uuid = SERVER_UUID;
        console.log(`Using server UUID ${uuid} for ${username}`);

        // Генерируем все конфигурации
        const allProfiles = generateAllVlessLinks(uuid);

        await bot.deleteMessage(chatId, statusMsg.message_id);

        // Создаем кнопки для выбора оператора
        const keyboard = operatorProfiles.map((profile, index) => [
            {
                text: `${profile.name} - ${profile.comment}`,
                callback_data: `profile_${index}`
            }
        ]);

        // Отправляем сообщение с выбором
        await bot.sendMessage(chatId, formatAllConfigs(allProfiles), {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'Error generating config. Try again later.');
    }
};

bot.onText(/\/config/, handleGetConfig);

bot.onText(/\/info/, (msg) => {
    let infoMessage = `*📡 Доступные конфигурации*\n\n`;

    operatorProfiles.forEach((profile, index) => {
        infoMessage += `${index + 1}. *${profile.name}*\n`;
        infoMessage += `   ${profile.comment}\n\n`;
    });

    bot.sendMessage(msg.chat.id, infoMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/stats/, (msg) => {
    bot.sendMessage(msg.chat.id,
        `*Статистика*\n\n` +
        `*Всего пользователей:* ${users.size}\n` +
        `*Выдано конфигураций:* ${users.size}`,
        { parse_mode: 'Markdown' });
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;

    if (query.data.startsWith('profile_')) {
        const profileIndex = parseInt(query.data.split('_')[1]);
        const profile = operatorProfiles[profileIndex];

        if (!profile) {
            await bot.answerCallbackQuery(query.id, { text: 'Error: Profile not found' });
            return;
        }

        await bot.answerCallbackQuery(query.id, { text: `Generating ${profile.name} config...` });

        try {
            const uuid = SERVER_UUID;
            const allProfiles = generateAllVlessLinks(uuid);
            const selectedProfile = allProfiles[profileIndex];

            // Генерируем QR-код для выбранной конфигурации
            const qrBuffer = await QRCode.toBuffer(selectedProfile.link);

            // Отправляем QR-код с конфигурацией
            await bot.sendPhoto(chatId, qrBuffer, {
                caption: formatConfigForOperator(uuid, selectedProfile),
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '◀️ Назад к выбору', callback_data: 'back_to_list' }],
                        [{ text: '📋 Все конфиги', callback_data: 'all_configs' }]
                    ]
                }
            });
        } catch (error) {
            console.error('Error generating QR:', error);
            bot.sendMessage(chatId, 'Error generating QR code. Try again later.');
        }
    } else if (query.data === 'back_to_list') {
        await bot.answerCallbackQuery(query.id);
        await handleGetConfig({ chat: { id: chatId }, from: query.from });
    } else if (query.data === 'all_configs') {
        await bot.answerCallbackQuery(query.id, { text: 'Sending all configs...' });

        try {
            const uuid = SERVER_UUID;
            const allProfiles = generateAllVlessLinks(uuid);

            let message = `*📱 ВСЕ КОНФИГУРАЦИИ*\n\n`;

            allProfiles.forEach((profile, index) => {
                message += `*${index + 1}. ${profile.name}*\n`;
                message += `${profile.comment}\n\n`;
                message += `\`${profile.link}\`\n\n`;
                message += `───────────────────────────\n\n`;
            });

            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Error sending all configs:', error);
            bot.sendMessage(chatId, 'Error sending configs. Try again later.');
        }
    }
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

console.log('Bot ready');
