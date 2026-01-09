import { ProfilesType } from "./types.js";
import dotenv from "dotenv";

dotenv.config();

const SHORT_ID = process.env.SHORT_ID || "";

export const operatorProfiles: ProfilesType[] = [
  {
    port: 443,
    sni: "yandex.ru",
    shortId: SHORT_ID,
    name: "Yandex",
    comment: "Универсальный, работает с Tele2, Билайн",
  },
  {
    port: 8443,
    sni: "vk.com",
    shortId: SHORT_ID,
    name: "VK",
    comment: "Хорошо для МТС, Билайн",
  },
  {
    port: 2053,
    sni: "mail.ru",
    shortId: SHORT_ID,
    name: "Mail.ru",
    comment: "Альтернатива для Билайн, Tele2",
  },
  {
    port: 2083,
    sni: "ok.ru",
    shortId: SHORT_ID,
    name: "OK.ru",
    comment: "Для Мегафон, МТС",
  },
  {
    port: 2087,
    sni: "rutube.ru",
    shortId: SHORT_ID,
    name: "RuTube",
    comment: "Альтернативный порт для всех операторов",
  },
];
