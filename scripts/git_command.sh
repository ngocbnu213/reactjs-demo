#!/bin/bash
git --version
cd /home/ec2-user
git clone https://nbngoc-vjp:Tinhbuon%401@github.com/VJP01/VJP-Employee-system.git
cd VJP-Employee-system
git checkout -b feature/#751_jenkins
git pull origin feature/#751_jenkins