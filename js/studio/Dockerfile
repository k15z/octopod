# Build
FROM node:22-alpine3.19 as build
ENV NODE_ENV=production
ENV YARN_VERSION=4.4.0
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare yarn@$YARN_VERSION --activate && yarn install && yarn build --base=/studio/

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
