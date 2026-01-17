import { ProfilesType } from "./types.js";
import dotenv from "dotenv";

dotenv.config();

const SHORT_ID = process.env.SHORT_ID || "";

export const operatorProfiles: ProfilesType[] = [
  {
    port: 443,
    sni: "www.eh.vk.com",
    shortId: SHORT_ID,
    name: "ВСЁ-ОБХОД",
    comment: "ВСЁ-ОБХОД",
  },
];
