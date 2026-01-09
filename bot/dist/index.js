import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { checkEnv } from "./helpers/base/utils.js";
import { registerCommands } from "./commands/index.js";
dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const SERVER_IP = process.env.SERVER_IP;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const SERVER_UUID = process.env.SERVER_UUID;
checkEnv({
    botToken: BOT_TOKEN,
    serverIp: SERVER_IP,
    publicKey: PUBLIC_KEY,
    serverUuid: SERVER_UUID,
});
export const bot = new TelegramBot(BOT_TOKEN, { polling: true });
export const users = new Map();
registerCommands(bot, SERVER_UUID, users);
console.log("Bot ready");
//# sourceMappingURL=index.js.map