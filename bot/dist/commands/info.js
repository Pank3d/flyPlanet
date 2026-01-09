import { operatorProfiles } from "../configStatic/config.js";
import { botSendMessage } from "../helpers/bot/index.js";
export const infoCommand = async (bot, msg) => {
    let infoMessage = `*📡 Доступные конфигурации*\n\n`;
    operatorProfiles.forEach((profile, index) => {
        infoMessage += `${index + 1}. ${profile.comment}\n\n`;
    });
    await botSendMessage(bot, msg.chat.id, infoMessage, { parse_mode: "Markdown" });
};
//# sourceMappingURL=info.js.map