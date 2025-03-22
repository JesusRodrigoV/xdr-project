#!/bin/bash

sudo -v

while true; do
  sudo -n true
  sleep 60
  kill -0 "$$" || exit
done 2>/dev/null &

# Update package lists and upgrade system
sudo apt update -y
sudo apt upgrade -y

# Install Suricata IDS/IPS
sudo apt install suricata -y

# Disable hugepages in Suricata config
sudo sed -i 's/use-hugepages: yes/use-hugepages: no/' /etc/suricata/suricata.yaml

# Update and start Suricata
sudo suricata-update
sudo suricata -c /etc/suricata/suricata.yaml -i eth0
