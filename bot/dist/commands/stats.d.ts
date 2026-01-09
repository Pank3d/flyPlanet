import TelegramBot from "node-telegram-bot-api";
export declare const statsCommand: (bot: TelegramBot, msg: TelegramBot.Message, users: Map<number, {
    username: string;
    timestamp: number;
}>) => Promise<void>;
//# sourceMappingURL=stats.d.ts.map