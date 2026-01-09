import dotenv from "dotenv";
import { EnvType } from "./types.js";

dotenv.config();

export const checkEnv = (args: EnvType) => {
  const { botToken, serverIp, publicKey, serverUuid } = args;
  if (!botToken || !serverIp || !publicKey || !serverUuid) {
    console.error("Error: Missing required environment variables");
    console.error(
      "Required: BOT_TOKEN, SERVER_IP, PUBLIC_KEY, SHORT_ID, SERVER_UUID"
    );
    process.exit(1);
  }
};
