FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

RUN npm run build

# Stage 2: NGINX Setup for SSL
FROM nginx:alpine

# Copy SSL certificates to the container
COPY certs/fullchain.pem /etc/nginx/ssl/nap_trade.pem
COPY certs/privkey.pem /etc/nginx/ssl/nap_trade_pvt.pem

# Copy custom NGINX configuration for SSL
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
