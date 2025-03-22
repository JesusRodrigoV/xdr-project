#!/bin/bash

echo "Por favor, selecciona tu entorno:"
echo "1) Windows (WSL)"
echo "2) Linux"
read -p "Ingresa tu opción (1-2): " environment_option

case $environment_option in
1)
  echo "Configurando para WSL..."
  IS_WSL=true
  ;;
2)
  echo "Configurando para Linux nativo..."
  IS_WSL=false
  ;;
*)
  echo "Opción inválida. Saliendo..."
  exit 1
  ;;
esac

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

# Configure Suricata based on environment
if [ "$IS_WSL" = true ]; then
  echo "Deshabilitando hugepages y af-packet para WSL..."
  # Disable hugepages and configure af-packet in Suricata config
  sudo sed -i 's/use-hugepages: yes/use-hugepages: no/' /etc/suricata/suricata.yaml
  sudo sed -i '/af-packet:/,/cluster-type: cluster_flow/{/fanout:/s/yes/no/}' /etc/suricata/suricata.yaml
else
  echo "Manteniendo configuración por defecto para Linux nativo..."
fi

# Restart Suricata
sudo systemctl restart suricata

# Update and start Suricata
sudo suricata-update
sudo suricata -c /etc/suricata/suricata.yaml -i eth0
