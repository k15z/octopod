FROM node:21-alpine3.19

WORKDIR /app

COPY yarn.lock package.json ./

RUN yarn install

COPY . .

EXPOSE 3000
RUN yarn build

CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "3000"]