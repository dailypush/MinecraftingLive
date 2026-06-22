#!/bin/bash

# Variables
MINECRAFT_DIR=~/minecraft-docker
CERTS_EMAIL="certs@saw.dev"
DOMAIN="map.minecrafting.live"
DOCKER_COMPOSE_FILE="$MINECRAFT_DIR/docker-compose.yml"

# Docker Compose content
DOCKER_COMPOSE_CONTENT="
version: '3'
services:
  certbot:
    image: certbot/certbot
    volumes:
      - certbot-etc:/etc/letsencrypt
      - certbot-var:/var/lib/letsencrypt
      - certbot-www:/var/www/certbot
volumes:
  certbot-etc:
  certbot-var:
  certbot-www:
"

# Functions
install_docker() {
    echo "Installing Docker"
    sudo yum update -y || { echo "Failed to update yum"; return 1; }
    sudo yum install -y yum-utils || { echo "Failed to install yum-utils"; return 1; }
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo || { echo "Failed to add Docker repo"; return 1; }
    sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin --allowerasing || { echo "Failed to install Docker"; return 1; }
    sudo systemctl start docker || { echo "Failed to start Docker"; return 1; }
    sudo docker run hello-world || { echo "Failed to run hello-world Docker container"; return 1; }
}

install_minecraft_docker() {
    echo "Installing Minecraft Docker"
    sudo mkdir -p $MINECRAFT_DIR || { echo "Failed to create Minecraft directory"; return 1; }
    cd $MINECRAFT_DIR || { echo "Failed to change directory to $MINECRAFT_DIR"; return 1; }
    sudo docker pull itzg/minecraft-server || { echo "Failed to pull Minecraft server image"; return 1; }
    sudo docker pull mide/minecraft-overviewer:latest || { echo "Failed to pull Minecraft overviewer image"; return 1; }
    sudo mkdir -p overviewer-data || { echo "Failed to create overviewer-data directory"; return 1; }
    sudo chown -R $(whoami):$(whoami) ./overviewer-data || { echo "Failed to change ownership of overviewer-data directory"; return 1; }
}

create_certs_directories() {
    echo "Creating directories for certificates"
    sudo mkdir -p certs certbot-etc certbot-www || { echo "Failed to create certificate directories"; return 1; }
    sudo chown -R $(whoami):$(whoami) ./certs ./certbot-etc ./certbot-www || { echo "Failed to change ownership of certificate directories"; return 1; }
}

generate_certs() {
    echo "Generating certificates"
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        echo "Creating Docker Compose file for certbot"
        sudo bash -c "echo \"$DOCKER_COMPOSE_CONTENT\" > \"$DOCKER_COMPOSE_FILE\"" || { echo "Failed to create Docker Compose file"; return 1; }
    fi
    cd $MINECRAFT_DIR || { echo "Failed to change directory to $MINECRAFT_DIR"; return 1; }
    sudo docker compose run --rm certbot certonly --webroot -w /var/www/certbot --email $CERTS_EMAIL -d $DOMAIN --agree-tos --no-eff-email || { echo "Failed to generate certificates"; return 1; }
}

update_firewall() {
    echo "Updating firewall"
    local ports=(80/tcp 443/tcp 25565/tcp 25565/udp 19132/udp)
    for port in "${ports[@]}"; do
        sudo firewall-cmd --permanent --zone=public --add-port=$port || { echo "Failed to add port $port to firewall"; return 1; }
    done
    sudo firewall-cmd --reload || { echo "Failed to reload firewall"; return 1; }
}

setup_cron() {
    echo "Setting up cron job"
    sudo touch /var/log/minecraft-cron.log || { echo "Failed to create cron log file"; return 1; }
    sudo chown $(whoami):$(whoami) /var/log/minecraft-cron.log || { echo "Failed to change ownership of cron log file"; return 1; }
    sudo chmod 640 /var/log/minecraft-cron.log || { echo "Failed to set permissions on cron log file"; return 1; }
    (sudo crontab -l 2>/dev/null; echo "0 2 * * * cd $MINECRAFT_DIR && make generate-map > /var/log/minecraft-cron.log 2>&1") | sudo crontab - || { echo "Failed to set up cron job"; return 1; }
}

start_maps_container() {
    echo "Starting maps container"
    sudo docker run -p 80:80 -p 443:443 -v $MINECRAFT_DIR/overviewer-data:/usr/share/nginx/html:ro leaflet-app --name maps || { echo "Failed to start maps container"; return 1; }
}

main() {
    install_docker || echo "Skipping Docker installation"
    install_minecraft_docker || echo "Skipping Minecraft Docker installation"
    create_certs_directories || echo "Skipping creation of certificate directories"
    generate_certs || echo "Skipping certificate generation"
    update_firewall || echo "Skipping firewall update"
    setup_cron || echo "Skipping cron setup"
    start_maps_container || echo "Skipping start of maps container"
}

main "$@"
