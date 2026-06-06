FROM node:22-alpine AS build

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN npm install -g serve@14

COPY --from=build /workspace/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
