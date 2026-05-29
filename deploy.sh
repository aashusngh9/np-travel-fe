#!/bin/bash
set -e

image_name="airfare-fe"

echo "==> Loading Docker image..."
docker load < ~/$image_name.tar

echo "==> Stopping existing container (if any)..."
docker stop $image_name 2>/dev/null || true
docker rm $image_name 2>/dev/null || true

echo "==> Starting container..."
docker run -d \
  --name $image_name \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  $image_name

echo "==> Done. Container is running."
docker ps --filter "name=$image_name"
