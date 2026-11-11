# Этап 1: Сборка (Build)
FROM node:20-alpine as build

WORKDIR /app

# Копируем файлы зависимостей и устанавливаем их
COPY package.json package-lock.json ./
RUN npm ci

# Копируем весь код и собираем продакшен-версию
COPY . .
RUN npm run build

# Этап 2: Раздача статики через Nginx (Production)
FROM nginx:alpine

# Копируем собранные файлы из первого этапа в папку Nginx
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]