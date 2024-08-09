FROM node:22-alpine3.19

ENV NODE_ENV=production
ENV YARN_VERSION=4.4.0

WORKDIR /app

COPY . .
EXPOSE 3000

RUN corepack enable && corepack prepare yarn@$YARN_VERSION --activate && yarn install && yarn build

CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "3000"]