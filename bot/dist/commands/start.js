import { botSendMessage } from "../helpers/bot/index.js";
export const startCommand = async (bot, msg) => {
    if (!msg.from)
        return;
    await botSendMessage(bot, msg.chat.id, `*Telegram Bot for VLESS + REALITY configs*\n\n` +
        `Your ID: \`${msg.from.id}\`\n\n` +
        `Use /config to get your configuration.`, { parse_mode: "Markdown" });
};
//# sourceMappingURL=start.js.map