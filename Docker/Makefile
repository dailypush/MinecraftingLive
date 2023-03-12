# Makefile
start:
	sudo docker compose up -d

update:
	sudo docker pull itzg/minecraft-server
	sudo docker pull mide/minecraft-overviewer

generate-map:
	time sudo docker run \
		-e MINECRAFT_VERSION="latest" \
        -v `pwd`/minecraft-data/world:/home/minecraft/server/world:ro \
        -v `pwd`/overviewer-data:/home/minecraft/render/:rw \
		mide/minecraft-overviewer:latest