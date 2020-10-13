#!/bin/bash
export NVM_DIR="/home/ec2-user/.nvm" 
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
git -v
cd /home/ec2-user/reactjs-demo
git pull
npm install
npm run build