import { ProfilesType } from "./types.js";

export const operatorProfiles: ProfilesType[] = [
  {
    port: 443,
    sni: "yandex.ru",
    shortId: "a1b2c3d4",
    name: "Yandex",
    comment: "Универсальный, работает с Tele2, Билайн",
  },
  {
    port: 8443,
    sni: "vk.com",
    shortId: "e5f6g7h8",
    name: "VK",
    comment: "Хорошо для МТС, Билайн",
  },
  {
    port: 2053,
    sni: "mail.ru",
    shortId: "i9j0k1l2",
    name: "Mail.ru",
    comment: "Альтернатива для Билайн, Tele2",
  },
  {
    port: 2083,
    sni: "ok.ru",
    shortId: "m3n4o5p6",
    name: "OK.ru",
    comment: "Для Мегафон, МТС",
  },
  {
    port: 2087,
    sni: "rutube.ru",
    shortId: "q7r8s9t0",
    name: "RuTube",
    comment: "Альтернативный порт для всех операторов",
  },
];
