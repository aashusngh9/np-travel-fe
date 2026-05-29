#!/bin/bash
set -e

image_name="airfare-fe"
ec2_host="ec2-user@ec2-13-62-28-33.eu-north-1.compute.amazonaws.com"
ssh_key="/Users/singhas/projects/personal/aws/default.pem"

echo "==> Building Docker image..."
docker build --platform="linux/amd64" --build-arg REACT_APP_API_BASE_URL='https://farecompare.site:8081' -t $image_name .

echo "==> Saving image to tar..."
docker save $image_name > $image_name.tar

echo "==> Copying tar to EC2..."
scp -i "$ssh_key" $image_name.tar $ec2_host:~

echo "==> Copying deploy script to EC2..."
scp -i "$ssh_key" deploy.sh $ec2_host:~/deploy.sh

echo "==> Done. SSH into EC2 and run: bash ~/deploy.sh"

rm -f $image_name.tar