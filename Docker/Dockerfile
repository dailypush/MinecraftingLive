# Use a lightweight NGINX image as the base image
FROM nginx:latest

# Set the working directory to /app
WORKDIR /app


# Set the ownership and permissions of the NGINX root directory to read-only for all users
RUN chown -R root:root /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html

# Expose port 80 for the NGINX server
EXPOSE 80 443

# Start the NGINX server in the foreground
CMD ["nginx", "-g", "daemon off;"]
