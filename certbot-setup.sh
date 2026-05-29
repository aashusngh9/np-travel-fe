#!/bin/bash
# Run this ONCE on the EC2 instance to obtain a Let's Encrypt certificate
# for farecompare.site and configure automatic renewal.
#
# Prerequisites:
#   - DNS A records for farecompare.site and www.farecompare.site must already
#     point to this server's public IP (propagation can take a few minutes).
#   - Port 80 must be open in the EC2 security group.
#
# Usage: bash certbot-setup.sh <email>
# Example: bash certbot-setup.sh you@example.com
set -e

DOMAIN="farecompare.site"
EMAIL="${1:?Usage: bash certbot-setup.sh <email>}"
IMAGE_NAME="airfare-fe"

echo "==> Installing certbot and cronie..."
if command -v dnf &>/dev/null; then
    sudo dnf install -y certbot cronie
elif command -v yum &>/dev/null; then
    sudo amazon-linux-extras install epel -y 2>/dev/null || true
    sudo yum install -y certbot cronie
else
    sudo apt-get update -qq && sudo apt-get install -y certbot cron
fi
sudo systemctl enable crond 2>/dev/null || sudo systemctl enable cron 2>/dev/null || true
sudo systemctl start crond 2>/dev/null || sudo systemctl start cron 2>/dev/null || true

echo "==> Stopping container to free port 80 for ACME challenge..."
docker stop $IMAGE_NAME 2>/dev/null || true

echo "==> Obtaining certificate for $DOMAIN and www.$DOMAIN..."
sudo certbot certonly \
  --standalone \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

echo "==> Certificate obtained."

# Wire pre/post hooks so certbot stops and restarts the container around renewals.
sudo mkdir -p /etc/letsencrypt/renewal-hooks/pre
sudo mkdir -p /etc/letsencrypt/renewal-hooks/post

sudo tee /etc/letsencrypt/renewal-hooks/pre/stop-airfare.sh > /dev/null <<'EOF'
#!/bin/bash
docker stop airfare-fe 2>/dev/null || true
EOF

sudo tee /etc/letsencrypt/renewal-hooks/post/start-airfare.sh > /dev/null <<'EOF'
#!/bin/bash
docker start airfare-fe 2>/dev/null || true
EOF

sudo chmod +x /etc/letsencrypt/renewal-hooks/pre/stop-airfare.sh
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/start-airfare.sh

echo "==> Setting up cron for automatic renewal (runs daily at 03:00)..."
(sudo crontab -l 2>/dev/null | grep -v 'certbot renew'; echo "0 3 * * * certbot renew --quiet") | sudo crontab -

echo "==> Starting container with cert mount..."
docker stop $IMAGE_NAME 2>/dev/null || true
docker rm $IMAGE_NAME 2>/dev/null || true
docker run -d \
  --name $IMAGE_NAME \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  $IMAGE_NAME

echo ""
echo "==> All done!"
echo "    Certificate : /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "    Private key : /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo "    Renewal     : daily cron at 03:00, only acts when < 30 days remain"
echo "    Site        : https://$DOMAIN"
