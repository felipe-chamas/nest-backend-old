FROM node:16
WORKDIR /app
COPY package*.json .
RUN yarn install --frozen-lockfile && yarn cache clean
COPY . ./
RUN yarn build
CMD ["yarn", "start:docker"]