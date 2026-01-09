import TelegramBot from "node-telegram-bot-api";

export const botAnswerCallbackQuery = async (
  bot: TelegramBot,
  callbackQueryId: string,
  options?: { text?: string; show_alert?: boolean; url?: string; cache_time?: number }
) => {
  return await bot.answerCallbackQuery(callbackQueryId, options);
};
