FROM node:10-alpine AS base
WORKDIR /usr/src/wunderpong
COPY package.json .

FROM base AS builder
RUN npm install --production
RUN cp -R node_modules node_modules_prod
RUN npm install
COPY . .
RUN npm run test
RUN npm run build

FROM base AS release
COPY --from=builder /usr/src/wunderpong/node_modules_prod ./node_modules
COPY --from=builder /usr/src/wunderpong/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
