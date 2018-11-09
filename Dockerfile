FROM node:10
WORKDIR /usr/src/wunderpong
RUN apt-get update && apt-get install -y cmake libx11-dev libpng-dev
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
