import TelegramBot from "node-telegram-bot-api";

export const botSendPhoto = async (
  bot: TelegramBot,
  chatId: number | string,
  photo: string | Buffer,
  options?: TelegramBot.SendPhotoOptions
) => {
  return await bot.sendPhoto(chatId, photo, options);
};
