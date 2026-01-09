import TelegramBot from "node-telegram-bot-api";
import QRCode from "qrcode";
import dotenv from "dotenv";
import { operatorProfiles } from "./configStatic/config.js";
import { generateAllVlessLinks } from "./helpers/vless/utils.js";
import { formatConfigForOperator, formatAllConfigs, } from "./helpers/configs/utils.js";
import { checkEnv } from "./helpers/base/utils.js";
dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const SERVER_IP = process.env.SERVER_IP;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const SERVER_UUID = process.env.SERVER_UUID;
checkEnv({
    botToken: BOT_TOKEN,
    serverIp: SERVER_IP,
    publicKey: PUBLIC_KEY,
    serverUuid: SERVER_UUID,
});
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const users = new Map();
bot.onText(/\/start/, async (msg) => {
    if (!msg.from)
        return;
    bot.sendMessage(msg.chat.id, `*Telegram Bot for VLESS + REALITY configs*\n\n` +
        `Your ID: \`${msg.from.id}\`\n\n` +
        `Use /config to get your configuration.`, { parse_mode: "Markdown" });
});
const handleGetConfig = async (msg) => {
    if (!msg.from)
        return;
    const chatId = msg.chat.id;
    const statusMsg = await bot.sendMessage(chatId, "Generating configurations...");
    try {
        const uuid = SERVER_UUID;
        // Генерируем все конфигурации
        const allProfiles = generateAllVlessLinks(uuid);
        await bot.deleteMessage(chatId, statusMsg.message_id);
        // Создаем кнопки для выбора оператора
        const keyboard = operatorProfiles.map((profile, index) => [
            {
                text: profile.comment,
                callback_data: `profile_${index}`,
            },
        ]);
        // Отправляем сообщение с выбором
        await bot.sendMessage(chatId, formatAllConfigs(allProfiles), {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: keyboard,
            },
        });
    }
    catch (error) {
        console.error("Error:", error);
        bot.sendMessage(chatId, "Error generating config. Try again later.");
    }
};
bot.onText(/\/config/, handleGetConfig);
bot.onText(/\/info/, (msg) => {
    let infoMessage = `*📡 Доступные конфигурации*\n\n`;
    operatorProfiles.forEach((profile, index) => {
        infoMessage += `${index + 1}. ${profile.comment}\n\n`;
    });
    bot.sendMessage(msg.chat.id, infoMessage, { parse_mode: "Markdown" });
});
bot.onText(/\/stats/, (msg) => {
    bot.sendMessage(msg.chat.id, `*Статистика*\n\n` +
        `*Всего пользователей:* ${users.size}\n` +
        `*Выдано конфигураций:* ${users.size}`, { parse_mode: "Markdown" });
});
bot.on("callback_query", async (query) => {
    if (!query.message || !query.data || !query.from)
        return;
    const chatId = query.message.chat.id;
    if (query.data.startsWith("profile_")) {
        const profileIndex = parseInt(query.data.split("_")[1]);
        const profile = operatorProfiles[profileIndex];
        if (!profile) {
            await bot.answerCallbackQuery(query.id, {
                text: "Error: Profile not found",
            });
            return;
        }
        await bot.answerCallbackQuery(query.id, {
            text: `Генерация конфигурации...`,
        });
        try {
            const uuid = SERVER_UUID;
            const allProfiles = generateAllVlessLinks(uuid);
            const selectedProfile = allProfiles[profileIndex];
            const qrBuffer = await QRCode.toBuffer(selectedProfile.link);
            await bot.sendPhoto(chatId, qrBuffer, {
                caption: formatConfigForOperator(selectedProfile),
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "◀️ Назад к выбору", callback_data: "back_to_list" }],
                        [{ text: "📋 Все конфиги", callback_data: "all_configs" }],
                    ],
                },
            });
        }
        catch (error) {
            console.error("Error generating QR:", error);
            bot.sendMessage(chatId, "Error generating QR code. Try again later.");
        }
    }
    else if (query.data === "back_to_list") {
        await bot.answerCallbackQuery(query.id);
        await handleGetConfig({
            chat: { id: chatId, type: "private" },
            from: query.from,
            message_id: 0,
            date: Date.now(),
        });
    }
    else if (query.data === "all_configs") {
        await bot.answerCallbackQuery(query.id, {
            text: "Sending all configs...",
        });
        try {
            const uuid = SERVER_UUID;
            const allProfiles = generateAllVlessLinks(uuid);
            let message = `*📱 ВСЕ КОНФИГУРАЦИИ*\n\n`;
            allProfiles.forEach((profile, index) => {
                message += `*${index + 1}.* ${profile.comment}\n\n`;
                message += `\`${profile.link}\`\n\n`;
                message += `───────────────────────────\n\n`;
            });
            await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
        }
        catch (error) {
            console.error("Error sending all configs:", error);
            bot.sendMessage(chatId, "Error sending configs. Try again later.");
        }
    }
});
bot.on("polling_error", (error) => {
    console.error("Polling error:", error);
});
console.log("Bot ready");
//# sourceMappingURL=index.js.map