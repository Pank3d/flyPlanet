import TelegramBot from "node-telegram-bot-api";

export const botDeleteMessage = async (
  bot: TelegramBot,
  chatId: number | string,
  messageId: number
) => {
  return await bot.deleteMessage(chatId, messageId);
};
