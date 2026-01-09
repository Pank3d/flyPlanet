import QRCode from "qrcode";
import { operatorProfiles } from "../configStatic/config.js";
import { generateAllVlessLinks } from "../helpers/vless/utils.js";
import { formatConfigForOperator } from "../helpers/configs/utils.js";
import { configCommand } from "./config.js";
import { botSendPhoto, botSendMessage, botAnswerCallbackQuery, } from "../helpers/bot/index.js";
export const handleCallbackQuery = async (bot, query, serverUuid) => {
    if (!query.message || !query.data || !query.from)
        return;
    const chatId = query.message.chat.id;
    if (query.data.startsWith("profile_")) {
        const profileIndex = parseInt(query.data.split("_")[1]);
        const profile = operatorProfiles[profileIndex];
        if (!profile) {
            await botAnswerCallbackQuery(bot, query.id, {
                text: "Error: Profile not found",
            });
            return;
        }
        await botAnswerCallbackQuery(bot, query.id, {
            text: `Генерация конфигурации...`,
        });
        try {
            const uuid = serverUuid;
            const allProfiles = generateAllVlessLinks(uuid);
            const selectedProfile = allProfiles[profileIndex];
            const qrBuffer = await QRCode.toBuffer(selectedProfile.link);
            await botSendPhoto(bot, chatId, qrBuffer, {
                caption: formatConfigForOperator(selectedProfile),
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Назад к выбору", callback_data: "back_to_list" }],
                        [{ text: "Все конфиги", callback_data: "all_configs" }],
                    ],
                },
            });
        }
        catch (error) {
            console.error("Error generating QR:", error);
            botSendMessage(bot, chatId, "Error generating QR code. Try again later.");
        }
    }
    else if (query.data === "back_to_list") {
        await botAnswerCallbackQuery(bot, query.id);
        await configCommand(bot, {
            chat: { id: chatId, type: "private" },
            from: query.from,
            message_id: 0,
            date: Date.now(),
        }, serverUuid);
    }
    else if (query.data === "all_configs") {
        await botAnswerCallbackQuery(bot, query.id, {
            text: "Sending all configs...",
        });
        try {
            const uuid = serverUuid;
            const allProfiles = generateAllVlessLinks(uuid);
            let message = `*📱 ВСЕ КОНФИГУРАЦИИ*\n\n`;
            allProfiles.forEach((profile, index) => {
                message += `*${index + 1}.* ${profile.comment}\n\n`;
                message += `\`${profile.link}\`\n\n`;
                message += `───────────────────────────\n\n`;
            });
            await botSendMessage(bot, chatId, message, { parse_mode: "Markdown" });
        }
        catch (error) {
            console.error("Error sending all configs:", error);
            botSendMessage(bot, chatId, "Error sending configs. Try again later.");
        }
    }
};
//# sourceMappingURL=callbackQuery.js.map