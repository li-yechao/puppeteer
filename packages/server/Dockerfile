FROM node:16-slim AS build

WORKDIR /app

COPY . /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN yarn install && \
	yarn build && \
	yarn install --prod && \
	rm -rf /target && \
	mkdir -p /target && \
	cp -r /app/package.json /app/node_modules /app/dist /target/

FROM node:16-slim

RUN apt update && apt install -y chromium ghostscript

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app/

COPY --from=build /target .


CMD ["yarn", "start:prod"]
