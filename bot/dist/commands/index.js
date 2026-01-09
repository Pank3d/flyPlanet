import { startCommand } from "./start.js";
import { configCommand } from "./config.js";
import { infoCommand } from "./info.js";
import { statsCommand } from "./stats.js";
import { handleCallbackQuery } from "./callbackQuery.js";
export const registerCommands = (bot, serverUuid, users) => {
    bot.onText(/\/start/, async (msg) => {
        await startCommand(bot, msg);
    });
    bot.onText(/\/config/, async (msg) => {
        await configCommand(bot, msg, serverUuid);
    });
    bot.onText(/\/info/, async (msg) => {
        await infoCommand(bot, msg);
    });
    bot.onText(/\/stats/, async (msg) => {
        await statsCommand(bot, msg, users);
    });
    bot.on("callback_query", async (query) => {
        await handleCallbackQuery(bot, query, serverUuid);
    });
    bot.on("polling_error", (error) => {
        console.error("Polling error:", error);
    });
};
//# sourceMappingURL=index.js.map