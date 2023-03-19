#!/bin/bash
set -e

sudo apt update

# backend
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.bashrc
nvm install v18.12.1

# frontend
sudo apt install nginx
sudo mkdir /opt/frontend
cd /opt/frontend
sudo chown `id -u` .
sudo service nginx start
sudo service nginx reload
