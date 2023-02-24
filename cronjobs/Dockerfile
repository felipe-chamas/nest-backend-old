FROM node:16
WORKDIR /app
COPY package*.json .
RUN yarn install --frozen-lockfile && yarn cache clean
COPY . ./
RUN yarn build
CMD printf "%s" "$ENV_FILE" > .env && node dist/main.js