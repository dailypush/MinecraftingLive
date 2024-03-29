echo "installing docker"
sudo yum install -y yum-utils
sudo yum-config-manager     --add-repo     https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin --allowerasing

sudo systemctl start docker
sudo docker run hello-world

echo "installing minecraft docker"
sudo mkdir minecraft-docker
sudo docker pull itzg/minecraft-server
sudo docker pull mide/minecraft-overviewer:latest
sudo docker pull
cd mincraft-docker
sudo mkdir overviewer-data 
sudo chown -R opc:opc ./overviewer-data

echo "making certs for mapswebsite"
sudo mkdir certs
sudo mkdir certbot-etc
sudo mkdir certbot-www
sudo chown -R opc:opc ./certs
sudo chown -R opc:opc ./certbot-etc
sudo chown -R opc:opc ./certbot-www

## more manual steps needed https://github.com/wmnnd/nginx-certbot

sudo docker compose run --rm certbot certonly --webroot -w /var/www/certbot --email certs@saw.dev -d map.minecrafting.live --agree-tos --no-eff-email


echo "updating firewall"
sudo firewall-cmd --permanent --zone=public --add-port=80/tcp
sudo firewall-cmd --permanent --zone=public --add-port=443/tcp
sudo firewall-cmd --reload

sudo firewall-cmd --permanent --zone=public --add-port=25565/tcp
sudo firewall-cmd --permanent --zone=public --add-port=25565/udp
sudo firewall-cmd --reload

#bedrock
sudo firewall-cmd --permanent --zone=public --add-port=19132/udp
sudo firewall-cmd --reload

sudo touch /var/log/minecraft-cron.log
sudo chown opc:opc /var/log/minecraft-cron.log
sudo chmod 640  /var/log/minecraft-cron.log
sudo crontab -l 2>/dev/null; echo "0 2 * * * cd ~/minecraft-docker && make generate-map > /var/log/minecraft-cron.log 2>&1") | crontab -
sudo docker run -p 80:80 -p 443:443 -v ./overviewer-data:/usr/share/nginx/html:ro leaflet-app --name maps