# Base #
#####################
FROM node:16-alpine AS base
USER $user
RUN mkdir -p /usr/src/app
RUN mkdir /usr/src/app/logs
WORKDIR /usr/src/app
COPY package*.json ./

# Production dependencies #
#############################
FROM base AS production-dependencies
RUN yarn install --production=true --frozen-lockfile


# Dev dependencies #
#############################
FROM production-dependencies AS dependencies
RUN yarn install --production=false --frozen-lockfile --ignore-scripts && yarn cache clean

# Builder #
########################
FROM base AS builder
COPY --from=dependencies --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN yarn run build:backend

# Production #
###########################
FROM base AS production
COPY --from=production-dependencies --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist/packages/backend ./dist
COPY --from=builder --chown=node:node /usr/src/app/ormconfig.js ./

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]