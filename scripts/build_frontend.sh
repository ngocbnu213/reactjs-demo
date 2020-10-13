#!/bin/bash
export NVM_DIR="/home/ec2-user/.nvm" 
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
git -v
cd /home/ec2-user/VJP-Employee-system
#git pull
npm install
cd react-app
sudo cp -f /home/ec2-user/ vjp-sys-enviroment/.env.production .
npm run build