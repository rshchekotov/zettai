FROM node:16-alpine as base

FROM base as dev
ENV NODE_ENV=development
WORKDIR /home/app
COPY ./discord /home/app/
RUN apk update \
  && apk upgrade \
  && npm i -g npm \
  && npm i -g pnpm \
  && pnpm i \
  && rm -rf /var/lib/apt/lists/*
CMD ["pnpm", "start:dev"]