# Используем официальный образ Node.js на базе Alpine (легкий)
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --production

# Копируем код бота
COPY . .

# Указываем переменные окружения (будут переопределены через docker-compose)
ENV BOT_TOKEN=""
ENV SERVER_IP=""
ENV PUBLIC_KEY=""

# Запускаем бота
CMD ["node", "index.js"]
