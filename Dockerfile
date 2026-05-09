FROM nginx:alpine

# Copy the static site content into nginx web root
COPY . /usr/share/nginx/html

# Expose the default nginx port
EXPOSE 80

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
