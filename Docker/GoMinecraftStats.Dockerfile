# Builder stage
FROM golang:1.18 AS build

WORKDIR /app
# Install curl and unzip
RUN apt-get update && \
    apt-get install -y curl unzip

# Set the URL for the minecraft-player-stats.zip file
# ARG DOWNLOAD_URL=https://github.com/dailypush/GoMinecraftStatStream/releases/download/linux/minecraft-player-stats.zip

# Download and unzip the minecraft-player-stats.zip file
# RUN curl -sLO ${DOWNLOAD_URL} && \
#     unzip minecraft-player-stats.zip

COPY ./data/GoMinecraftStatStream ./minecraft-player-stats
RUN chmod +x ./minecraft-player-stats

# Remaining Dockerfile commands...

#######################
# Runtime stage

FROM gcr.io/distroless/base

# Set the working directory
WORKDIR /app

# Copy the binary from the build stage
COPY --from=build /app/minecraft-player-stats .

EXPOSE 8200

ENTRYPOINT ["./minecraft-player-stats"]
