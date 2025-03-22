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

After entering Ubuntu, continue with the regular installation steps below.

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
