# Docker Deployment Guide for MERN QMS

This project now includes a complete **Docker** setup to fix package conflicts and ensure enterprise-level consistency across environments.

## Prerequisities
- Install **Docker Desktop** (Mac/Windows) or **Docker Engine** (Linux).

## How to Run (Deployment Mode)

1.  **Stop any running servers**:
    If you have `npm run dev` running, stop it (Ctrl+C).

2.  **Build and Start Containers**:
    Run the following command in the root directory:
    ```bash
    docker-compose up --build
    ```
    *This might take a few minutes the first time as it downloads `node:18` images and installs dependencies inside isolated containers.*

3.  **Access the Application**:
    - **Frontend**: [http://localhost:5177](http://localhost:5177)
    - **API Gateway**: [http://localhost:8002](http://localhost:8002)

## Why this fixes your issues?
- **Isolated Environments**: Each service runs in its own Linux container (`node:18-alpine`). No more conflicts with your Mac's node version or global packages.
- **Fixed Network**: The `docker-compose.yml` sets up a dedicated network (`qms-network`). Services talk to each other reliably using internal hostnames (`auth-service`, `quiz-service`).
- **Local MongoDB**: A local `mongo` container is included. This bypasses the "cloud connection timeout" issues you faced with MongoDB Atlas. **Your data will be stored locally in a docker volume.**

## Troubleshooting
- **Ports already in use**: ensure you stopped your local node server.
- **Buffers/Timeouts**: The local MongoDB container eliminates network latency to Atlas.
