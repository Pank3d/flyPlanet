import { VlessLinkResult } from "../vless/types.js";

export const formatConfigForOperator = (
  profileData: VlessLinkResult
): string => {
  return `*${profileData.comment}*\n\n` + `\`${profileData.link}\``;
};

export const formatAllConfigs = (profiles: VlessLinkResult[]): string => {
  let message = `*📱 Выберите конфигурацию для вашего оператора:*\n\n`;

  profiles.forEach((profile, index) => {
    message += `*${index + 1}.* ${profile.comment}\n\n`;
  });

  return message;
};
