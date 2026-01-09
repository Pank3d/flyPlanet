export const formatConfigForOperator = (profileData) => {
    return `*${profileData.comment}*\n\n` + `\`${profileData.link}\``;
};
export const formatAllConfigs = (profiles) => {
    let message = `*📱 Выберите конфигурацию для вашего оператора:*\n\n`;
    profiles.forEach((profile, index) => {
        message += `*${index + 1}.* ${profile.comment}\n\n`;
    });
    return message;
};
//# sourceMappingURL=utils.js.map