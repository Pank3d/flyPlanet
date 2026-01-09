import { botSendMessage } from "../helpers/bot/index.js";
export const statsCommand = async (bot, msg, users) => {
    await botSendMessage(bot, msg.chat.id, `*Статистика*\n\n` +
        `*Всего пользователей:* ${users.size}\n` +
        `*Выдано конфигураций:* ${users.size}`, { parse_mode: "Markdown" });
};
//# sourceMappingURL=stats.js.map