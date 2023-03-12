# Use a lightweight NGINX image as the base image
FROM nginx:latest

# Set the working directory to /app
WORKDIR /app

# Copy the Leaflet.js files to the /app directory
COPY /overviewer-data/index.html /app/
COPY /overviewer-data/leaflet.js /app/
COPY /overviewer-data/leaflet.css /app/

# Copy the files from the /overviewer-data directory to the NGINX root directory
COPY /overviewer-data /usr/share/nginx/html/

# Set the ownership and permissions of the NGINX root directory to read-only for all users
RUN chown -R root:root /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html

# Expose port 80 for the NGINX server
EXPOSE 80

# Start the NGINX server in the foreground
CMD ["nginx", "-g", "daemon off;"]
