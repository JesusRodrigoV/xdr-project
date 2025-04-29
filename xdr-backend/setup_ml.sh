#!/bin/bash

if command -v python3.10 &>/dev/null; then
  PYTHON_CMD=python3.10
elif command -v python3.11 &>/dev/null; then
  PYTHON_CMD=python3.11
else
  echo "Error: Se requiere Python 3.10 o 3.11"
  exit 1
fi

echo "Usando $($PYTHON_CMD --version)"

if [ -d "venv" ]; then
  echo "Removiendo entorno virtual anterior..."
  rm -rf venv
fi

echo "Creando nuevo entorno virtual..."
$PYTHON_CMD -m venv venv --clear

echo "Activando entorno virtual..."
source venv/bin/activate

echo "Actualizando pip..."
python -m pip install --upgrade pip

echo "Instalando dependencias..."
if ! pip install -r requirements.txt; then
  echo "Error: Falló la instalación de dependencias"
  exit 1
fi

# Verificar que los paquetes críticos estén instalados correctamente
echo "Verificando instalación de dependencias..."
for package in pandas scikit-learn joblib numpy; do
  if ! python -c "import $package" 2>/dev/null; then
    echo "Error: No se pudo importar $package"
    echo "Intentando reinstalar $package..."
    if ! pip install --no-cache-dir $package; then
      echo "Error: Falló la reinstalación de $package"
      exit 1
    fi
  fi
done

echo "Todas las dependencias instaladas correctamente"

echo "Creando directorios necesarios..."
mkdir -p src/ml/model

echo "Entrenando modelo..."
python src/ml/suricata_model.py

echo "¡Configuración de ML completada!"
echo "Python version: $(python --version)"
echo "Pip version: $(pip --version)"
