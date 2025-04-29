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

# Verificar si el archivo existe
if [ ! -f "$SURICATA_CONFIG" ]; then
  echo "Error: No se encuentra el archivo $SURICATA_CONFIG"
  exit 1
fi

# Respaldar el archivo original con sudo
echo "Creando backup de configuración..."
if ! sudo cp "$SURICATA_CONFIG" "${SURICATA_CONFIG}.bak"; then
  echo "Error: No se pudo crear el backup del archivo de configuración"
  exit 1
fi

# Actualizar el archivo de configuración con la nueva interfaz usando sudo
echo "Actualizando configuración de Suricata..."
if ! sudo sed -i "s/^\(\s*-\s*interface:\s*\).*/\1$INTERFACE/" "$SURICATA_CONFIG"; then
  echo "Error: No se pudo actualizar el archivo de configuración"
  exit 1
fi

echo "✅ El archivo suricata.yaml ha sido actualizado exitosamente con la interfaz $INTERFACE"

# Verificar que los cambios se realizaron correctamente
if sudo grep -A 1 "af-packet:" "$SURICATA_CONFIG"; then
  echo "✅ Configuración verificada correctamente"
else
  echo "⚠️ No se pudo verificar la configuración"
fi

check_docker_wsl() {
  echo "Verificando Docker en WSL..."
  if ! command -v docker &>/dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker Desktop para Windows desde: https://docs.docker.com/desktop/install/windows-install/"
    echo "Después de instalarlo, asegúrate de:"
    echo "1. Habilitar la integración con WSL en Docker Desktop"
    echo "2. Reiniciar tu WSL con: wsl --shutdown"
    exit 1
  fi

  # Check if docker daemon is responding
  if ! docker info >/dev/null 2>&1; then
    echo "❌ No se puede conectar al daemon de Docker."
    echo "Por favor, verifica que:"
    echo "1. Docker Desktop está corriendo en Windows"
    echo "2. La integración con WSL está habilitada en Docker Desktop"
    echo "3. Reinicia WSL si es necesario con: wsl --shutdown"
    exit 1
  fi

  echo "✅ Docker está funcionando correctamente en WSL"
}

# Function to check Docker in native Linux
check_docker_linux() {
  echo "Verificando Docker en Linux..."
  if ! systemctl is-active --quiet docker; then
    echo "El servicio de Docker no está corriendo. Intentando iniciarlo..."
    sudo systemctl start docker
    sleep 5
    if ! systemctl is-active --quiet docker; then
      echo "❌ No se pudo iniciar el servicio de Docker"
      exit 1
    fi
  fi
  echo "✅ Docker está funcionando correctamente en Linux"
}

# Check if Docker is installed, if not install it
if ! command -v docker &>/dev/null; then
  echo "Docker no está instalado. Instalando Docker..."
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" |
    sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# Add user to docker group
sudo usermod -aG docker "$USER"
echo "✅ Usuario agregado al grupo docker"

# Instead of using newgrp which causes script interruption,
# we'll use a subshell to get docker group permissions
if ! groups | grep -q docker; then
  echo "⚙️ Activando permisos de grupo docker..."
  sg docker -c true
fi

# Verify Docker based on environment
echo "🔍 Verificando configuración de Docker..."
if [ "$IS_WSL" = true ]; then
  check_docker_wsl
else
  check_docker_linux
fi
echo "✅ Verificación de Docker completada"

echo "-------------------------------------------------"
echo "🚀 Instalando Elasticsearch y Kibana localmente"
echo "-------------------------------------------------"

# Install ElasticSearch with error handling
echo "Instalando Elasticsearch y Kibana..."
if ! curl -fsSL https://elastic.co/start-local | sh; then
  echo "❌ Error ejecutando el script de instalación de Elasticsearch"
  echo "Por favor, verifica que:"
  echo "1. Docker Desktop está corriendo"
  echo "2. Tienes conexión a internet"
  echo "3. Los puertos 5601 y 9200 están disponibles"
  exit 1
fi

# Verify Elasticsearch is responding
echo "Verificando que Elasticsearch esté respondiendo..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
  if curl -s "http://localhost:9200/_cluster/health" >/dev/null; then
    echo "✅ Elasticsearch está funcionando correctamente"
    break
  fi
  echo "⏳ Esperando que Elasticsearch esté listo... Intento $attempt de $max_attempts"
  sleep 10
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  echo "❌ Elasticsearch no respondió después de 5 minutos"
  echo "Por favor, verifica los logs con: docker logs elastic-start-local-elasticsearch-1"
  exit 1
fi

# Verify Kibana is responding
echo "Verificando que Kibana esté respondiendo..."
attempt=1
while [ $attempt -le $max_attempts ]; do
  if curl -s "http://localhost:5601/api/status" >/dev/null; then
    echo "✅ Kibana está funcionando correctamente"
    break
  fi
  echo "⏳ Esperando que Kibana esté listo... Intento $attempt de $max_attempts"
  sleep 10
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  echo "❌ Kibana no respondió después de 5 minutos"
  echo "Por favor, verifica los logs con: docker logs elastic-start-local-kibana-1"
  exit 1
fi

echo "✅ Elastic Stack instalado y funcionando correctamente"
echo "🌐 Puedes acceder a:"
echo "   - Elasticsearch: http://localhost:9200"
echo "   - Kibana: http://localhost:5601"

# Preparing the instalation of Logstash
echo "🔧 Configurando repositorio de Logstash..."
# Forzar sobreescritura del archivo GPG con -y
sudo rm -f /usr/share/keyrings/elastic-keyring.gpg
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elastic-keyring.gpg

echo "📦 Instalando dependencias necesarias..."
sudo apt-get install -y apt-transport-https
echo "deb [signed-by=/usr/share/keyrings/elastic-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-8.x.list

# Install Logstash with error handling
echo "🚀 Instalando Logstash (esto puede tardar varios minutos)..."
if ! (sudo apt-get update && DEBIAN_FRONTEND=noninteractive sudo apt-get install -y logstash); then
  echo "❌ Error instalando Logstash"
  exit 1
fi

echo "✅ Logstash instalado correctamente"

# Start and enable Logstash service
echo "🔄 Iniciando servicio de Logstash..."
sudo systemctl start logstash
sudo systemctl enable logstash

# Verificar que Logstash está corriendo
max_attempts=12
attempt=1
while [ $attempt -le $max_attempts ]; do
  if sudo systemctl is-active --quiet logstash; then
    echo "✅ Servicio de Logstash iniciado correctamente"
    break
  fi
  echo "⏳ Esperando que Logstash inicie... Intento $attempt de $max_attempts"
  sleep 10
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  echo "⚠️ Logstash está tardando más de lo esperado en iniciar"
fi

# Configurar Logstash
LOGSTASH_CONF="/etc/logstash/conf.d/suricata.conf"

sudo tee $LOGSTASH_CONF >/dev/null <<EOL
input {
  http {
    port => 5044
  }
}

filter {
  mutate {
    add_field => {
      "[@metadata][elastic_username]" => "$ELASTIC_USER"
      "[@metadata][elastic_password]" => "$ELASTIC_PASSWORD"
    }
  }
}

output {
  if [anomaly] == "true" {
    elasticsearch {
      hosts => ["http://${ELASTIC_ENDPOINT}"]
      index => "suricata-anomalies-%%{+YYYY.MM.dd}"
      user => "$ELASTIC_USER"
      password => "$ELASTIC_PASSWORD"
    }
  }
}
EOL

# Reiniciar servicios
sudo systemctl restart logstash

echo "Configuración completa!"

# Remove unused packages
sudo apt-get autoremove -y

echo "¡Instalación completada con éxito!"
