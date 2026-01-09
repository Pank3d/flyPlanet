import TelegramBot from "node-telegram-bot-api";
import { botSendMessage } from "../helpers/bot/index.js";

export const statsCommand = async (
  bot: TelegramBot,
  msg: TelegramBot.Message,
  users: Map<number, { username: string; timestamp: number }>
) => {
  await botSendMessage(
    bot,
    msg.chat.id,
    `*Статистика*\n\n` +
      `*Всего пользователей:* ${users.size}\n` +
      `*Выдано конфигураций:* ${users.size}`,
    { parse_mode: "Markdown" }
  );
};
