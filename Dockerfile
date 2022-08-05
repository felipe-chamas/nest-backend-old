# Base #
#####################
FROM node:16-alpine AS base
USER $user
WORKDIR /usr/src/app
COPY package*.json ./

################
# Dependencies #
################
FROM base AS dependencies
RUN yarn install --production=false --frozen-lockfile && yarn cache clean

# Builder #
########################
FROM base AS builder
COPY --from=dependencies --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN yarn run build:backend && npm prune --omit=dev --legacy-peer-deps

# Production #
###########################
FROM base AS production
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist/packages/backend ./dist
COPY --from=builder --chown=node:node /usr/src/app/ormconfig.js ./

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
