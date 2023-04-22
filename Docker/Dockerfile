# Use a lightweight NGINX image as the base image
FROM nginx:latest

COPY ./data/nginx /etc/nginx/conf.d

# Expose port 80 for the NGINX server
EXPOSE 80 443

# Start the NGINX server in the foreground
CMD ["nginx", "-g", "daemon off;"]
