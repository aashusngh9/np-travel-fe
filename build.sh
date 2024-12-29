#!/bin/bash

# Set the image name
image_name="airfare-fe"

# Build the Docker image
#docker build --platform="linux/amd64" -t $image_name .
docker build --platform="linux/amd64" --build-arg REACT_APP_API_BASE_URL='https://farecompare.site:8081' -t $image_name .

# Save the Docker image as a tar file
docker save $image_name > $image_name.tar

# Upload the tar file to the server using scp
#scp -i /Users/singhas/p-projects/first-key-pair.pem $image_name.tar ubuntu@ec15-51-20-94-47.eu-north-1.compute.amazonaws.com:~
scp -i "/Users/singhas/p-projects/first-key-pair.pem" $image_name.tar ubuntu@ec2-13-49-245-200.eu-north-1.compute.amazonaws.com:~

# Clean up the tar file (optional)
#rm $image_name.tar