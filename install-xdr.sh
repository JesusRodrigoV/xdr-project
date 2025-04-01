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
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:oisf/suricata-stable
sudo apt-get update
sudo apt install suricata jq

sudo suricata-update
# Obtener la interfaz activa que NO sea 'lo'
INTERFACE=$(ip -o link show | awk '{print $2, $9}' | grep UP | awk -F: '{print $1}' | grep -v '^lo$')

# Verificar si se encontró una interfaz válida
if [ -z "$INTERFACE" ]; then
  echo "No se encontró ninguna interfaz activa válida (diferente de 'lo')."
  exit 1
fi

echo "Interfaz detectada: $INTERFACE"

# Ruta al archivo suricata.yaml
SURICATA_CONFIG="/etc/suricata/suricata.yaml"

# Respaldar el archivo original
cp $SURICATA_CONFIG "${SURICATA_CONFIG}.bak"

# Actualizar el archivo de configuración con la nueva interfaz
sed -i "s/^\(\s*-\s*interface:\s*\).*/\1$INTERFACE/" $SURICATA_CONFIG

echo "El archivo suricata.yaml ha sido actualizado con la interfaz $INTERFACE"

sudo systemctl start suricata
sudo systemctl enable suricata

# Preparing the instalation ElasticSearch
sudo usermod -aG docker "$USER"
newgrp docker

# Install ElasticSearch
curl -fsSL https://elastic.co/start-local | sh

# Preparing the instalation of Logstash
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elastic-keyring.gpg

sudo apt-get install apt-transport-https
echo "deb [signed-by=/usr/share/keyrings/elastic-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-8.x.list

# Install Logstash
sudo apt-get update && sudo apt-get install logstash
