import { operatorProfiles } from "../configStatic/config.js";
import { generateAllVlessLinks } from "../helpers/vless/utils.js";
import { formatAllConfigs } from "../helpers/configs/utils.js";
import { botSendMessage, botDeleteMessage, } from "../helpers/bot/index.js";
export const configCommand = async (bot, msg, serverUuid) => {
    if (!msg.from)
        return;
    const chatId = msg.chat.id;
    const statusMsg = await botSendMessage(bot, chatId, "Generating configurations...");
    try {
        const uuid = serverUuid;
        const allProfiles = generateAllVlessLinks(uuid);
        await botDeleteMessage(bot, chatId, statusMsg.message_id);
        const keyboard = operatorProfiles.map((profile, index) => [
            {
                text: profile.comment,
                callback_data: `profile_${index}`,
            },
        ]);
        await botSendMessage(bot, chatId, formatAllConfigs(allProfiles), {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: keyboard,
            },
        });
    }
    catch (error) {
        console.error("Error:", error);
        botSendMessage(bot, chatId, "Error generating config. Try again later.");
    }
};
//# sourceMappingURL=config.js.map