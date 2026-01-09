import TelegramBot from "node-telegram-bot-api";

export const botSendMessage = async (
  bot: TelegramBot,
  chatId: number | string,
  text: string,
  options?: TelegramBot.SendMessageOptions
) => {
  return await bot.sendMessage(chatId, text, options);
};
