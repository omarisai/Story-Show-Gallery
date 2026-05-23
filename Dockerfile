FROM node:20-alpine AS builder
WORKDIR /app

# Copy the site sources, install dependencies, and generate index.html from images/
COPY . .
RUN npm ci && npm run generate

FROM nginx:alpine

# Copy the generated static site into nginx web root
COPY --from=builder /app /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
