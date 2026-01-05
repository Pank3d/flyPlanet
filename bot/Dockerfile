# Используем официальный образ Node.js на базе Alpine (легкий)
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json
COPY package.json ./

# Устанавливаем зависимости
RUN npm install --production --no-package-lock

# Копируем код бота
COPY index.js ./

# Указываем переменные окружения (будут переопределены через docker-compose)
ENV BOT_TOKEN=""
ENV SERVER_IP=""
ENV PUBLIC_KEY=""
ENV SHORT_ID=""

# Запускаем бота
CMD ["node", "index.js"]
