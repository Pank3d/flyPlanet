import TelegramBot from "node-telegram-bot-api";
import { generateAllVlessLinks } from "../helpers/vless/utils.js";
import {
  botSendMessage,
  botDeleteMessage,
} from "../helpers/bot/index.js";

export const configCommand = async (
  bot: TelegramBot,
  msg: TelegramBot.Message,
  serverUuid: string
) => {
  if (!msg.from) return;

  const chatId = msg.chat.id;

  const statusMsg = await botSendMessage(
    bot,
    chatId,
    "Генерация конфигурации..."
  );

  try {
    const uuid = serverUuid;
    const allProfiles = generateAllVlessLinks(uuid);
    await botDeleteMessage(bot, chatId, statusMsg.message_id);

    // Выдаём только первый (единственный) конфиг
    const config = allProfiles[0];
    const message = `*${config.comment}*\n\n\`${config.link}\``;

    await botSendMessage(bot, chatId, message, {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Error:", error);
    botSendMessage(bot, chatId, "Ошибка генерации конфига. Попробуйте позже.");
  }
};
