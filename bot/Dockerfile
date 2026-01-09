# Используем официальный образ Node.js на базе Alpine (легкий)
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая devDependencies для сборки)
RUN npm install

# Копируем исходный код и конфигурацию TypeScript
COPY src ./src
COPY tsconfig.json ./

# Собираем TypeScript проект
RUN npm run build

# Удаляем devDependencies для уменьшения размера образа
RUN npm prune --production

# Указываем переменные окружения (будут переопределены через docker-compose)
ENV BOT_TOKEN=""
ENV SERVER_IP=""
ENV PUBLIC_KEY=""
ENV SHORT_ID=""
ENV SERVER_UUID=""

# Запускаем скомпилированный код
CMD ["node", "dist/index.js"]
