# Base #
#####################
FROM node:16-alpine AS base

USER node

WORKDIR /home/node/app
COPY package*.json ./

# Production dependencies #
#############################
FROM base AS production-dependencies
ENV NODE_ENV=production
RUN yarn install --production=true --frozen-lockfile


# Dev dependencies #
#############################
FROM production-dependencies AS dependencies
ENV NODE_ENV=development
RUN yarn install --production=false --frozen-lockfile --ignore-scripts && yarn cache clean

# Builder #
########################
FROM base AS builder
ENV NODE_ENV=development
COPY --from=dependencies --chown=node:node /home/node/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN yarn run build:backend

# Production #
###########################
FROM base AS production
ENV NODE_ENV=production
COPY --from=production-dependencies --chown=node:node /home/node/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /home/node/app/dist/packages/backend ./dist
COPY --from=builder --chown=node:node /home/node/app/.env ./

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]