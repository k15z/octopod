# Build
FROM node:22-alpine3.19 AS build
ENV NODE_ENV=production
WORKDIR /app
COPY . .
RUN npm install --dev && npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
