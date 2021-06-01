#!/bin/bash

yum -y update

# Install and setup nginx
amazon-linux-extras install -y nginx1
cat - << EOL > /etc/nginx/conf.d/server.conf
server {
    listen       80;
    server_name  sushi-chat.tk; # Should change to real hostname

    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-Host \$host;
    proxy_set_header X-Forwarded-Server \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

    location / {
        proxy_pass http://localhost:7000;
    	proxy_http_version 1.1;
    	proxy_set_header Upgrade \$http_upgrade;
    	proxy_set_header Connection "upgrade";
    }
}
EOL
systemctl start nginx
systemctl enable nginx

# Install node.js and npm
curl --silent --location https://rpm.nodesource.com/setup_14.x | bash -
yum -y install nodejs
npm install -g npm

# Install git
yum -y install git

# Download app source
mkdir /app
chmod 705 /app
git clone https://github.com/KoukiNAGATA/sushi-chat.git /app

# Build and start app
cd /app/server
npm install
npm run build
npm run start & # listen on localhost:7000