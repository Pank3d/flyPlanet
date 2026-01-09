import { operatorProfiles } from "../../configStatic/config";
import { ProfilesType } from "../../configStatic/types";
import dotenv from "dotenv";
import { VlessLinkResult } from "./types";

dotenv.config();

const PUBLIC_KEY = process.env.PUBLIC_KEY as string;
const SERVER_IP = process.env.SERVER_IP as string;

export const generateVlessLink = (
  uuid: string,
  profile: ProfilesType
): string => {
  const operatorsPart = profile.comment.split(" - ")[1] || profile.comment;
  const operators = operatorsPart
    .replace(/универсальный,?\s?/gi, "")
    .replace(/работает с\s?/gi, "")
    .replace(/хорошо для\s?/gi, "")
    .replace(/для\s?/gi, "")
    .replace(/альтернатива для\s?/gi, "")
    .replace(/альтернативный порт для всех операторов/gi, "Все операторы")
    .replace(/стабильно работает на всех операторах/gi, "Все операторы")
    .trim();

  const configName = operators;

  const params = new URLSearchParams({
    type: "tcp",
    security: "reality",
    fp: "chrome",
    pbk: PUBLIC_KEY,
    sni: profile.sni,
    sid: profile.shortId,
    spx: "/",
    flow: "xtls-rprx-vision",
  });
  return `vless://${uuid}@${SERVER_IP}:${
    profile.port
  }?${params}#${encodeURIComponent(configName)}`;
};

export const generateAllVlessLinks = (uuid: string): VlessLinkResult[] => {
  return operatorProfiles.map((profile) => ({
    name: profile.name,
    comment: profile.comment,
    port: profile.port,
    sni: profile.sni,
    link: generateVlessLink(uuid, profile),
  }));
};
