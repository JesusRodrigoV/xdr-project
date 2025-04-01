# XDR Project

Extended Detection and Response (XDR) project for advanced threat detection and analysis.

## Description

This project implements an XDR solution that provides comprehensive threat detection, analysis, and response capabilities across multiple security layers.

## Features

- Real-time threat detection
- Advanced threat analysis
- Automated response capabilities
- Cross-platform security monitoring
- Integration with existing security tools

## Prerequisites

- Node.js 18 or higher
- Bun runtime
- Git

### For Windows Users

Important: Windows users must follow these manual installation steps before running the automated script.

1. Install WSL

WSL (Windows Subsystem for Linux) allows you to run Linux on Windows. Install it and set it to version 2:

```powershell
wsl --install
wsl --set-default-version 2
```

2. Install Ubuntu Distribution

Install Ubuntu in WSL:

```powershell
wsl --install -d Ubuntu
```

3. Access Ubuntu

Once installation is complete, open Ubuntu from the Start menu or run:

```powershell
wsl -d Ubuntu
```

After entering Ubuntu, follow these Docker setup steps:

4. Install Docker Desktop

#### For Windows

1. Download Docker Desktop from the [official website](https://www.docker.com/products/docker-desktop/)
2. Run the installer (Docker Desktop Installer.exe)
3. During installation, ensure the "Use WSL 2 instead of Hyper-V" option is selected
4. Complete the installation and restart your computer

#### For Linux

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker packages:
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

5. Configure Docker Desktop with WSL 2 (Windows only)
1. Open Docker Desktop
1. Go to Settings (⚙️) > General
1. Ensure "Use the WSL 2 based engine" is checked
1. Go to Settings > Resources > WSL Integration
1. Enable "Ubuntu" distribution
1. Click "Apply & Restart"

1. Verify Docker Installation

```bash
# Test Docker installation
docker --version
docker compose version

# Test Docker functionality
docker run hello-world
```

Now you can proceed with the XDR project installation.

## Installation

```bash
git clone https://github.com/JesusRodrigoV/xdr-project.git
cd xdr-project
chmod +x install-xdr.sh
./install-xdr.sh
```

### Installation manual

1. Clone the repository:

```bash
git clone https://github.com/JesusRodrigoV/xdr-project.git
```

2. Navigate to the project directory:

```bash
cd xdr-project
```

3. Make the installation script executable:

```bash
chmod +x install-xdr.sh
```

4. Run the installation script:

```bash
./install-xdr.sh
```

## Project Structure

```
xdr-project/
├── xdr-backend/        # Backend services and API
├── xdr-frontend/        # Frontend dashboard
├── install-xdr.sh      # Installation script
└── README.md          # This file
```
