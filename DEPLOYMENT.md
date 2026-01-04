# Deployment Guide for MERN-QMS

This guide outlines the steps to deploy the MERN Quiz Management System (QMS) to a production environment.

## 1. Hosting Provider & Infrastructure

For a microservices architecture like this, using a container-orchestration platform or a VPS with Docker is recommended. 
**Recommended Providers:**
*   **DigitalOcean Droplet** (Docker)
*   **AWS EC2** (Docker)
*   **Heroku / Render** (Container deployment support)

**Prerequisites:**
*   A server (Ubuntu 22.04 LTS recommended)
*   Domain name (optional but recommended)
*   Docker & Docker Compose installed on the server

## 2. Environment Configuration

### Production Variables
Ensure your `.env` files for each service are updated for production. **DO NOT** commit `.env` files to Git. Create them on the server or use your host's environment variable manager.

**Critical Changes for Production:**
*   `NODE_ENV=production`
*   `MONGO_URI`: Use a secure MongoDB Atlas cluster or a secured local instance with authentication.
*   `REDIS_URL`: Ensure Redis is password protected if exposed, or use internal networking.
*   `JWT_SECRET`: Use a strong, long, random string.
*   `CLIENT_URL`: Update to your actual domain (e.g., `https://qms.yourdomain.com`).
*   `VITE_API_GATEWAY_URL`: Update client `.env` to point to your production API Gateway (e.g., `https://api.qms.yourdomain.com/api`).

## 3. Deployment via Docker Compose (Recommended)

This project is set up with `docker-compose.yml`, making deployment straightforward.

### Steps:

1.  **SSH into your server:**
    ```bash
    ssh user@your_server_ip
    ```

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/MERN-QMS.git
    cd MERN-QMS
    ```

3.  **Update Deployment Configuration:**
    *   Review `docker-compose.yml`.
    *   Consider using a reverse proxy like **Nginx** in front of the API Gateway and Client for SSL termination (HTTPS).

4.  **Set Environment Variables:**
    Create a `.env` file at the root or specific .env files in service directories as needed.

5.  **Build and Run:**
    ```bash
    docker-compose up -d --build
    ```

6.  **Verify Status:**
    ```bash
    docker-compose ps
    ```

## 4. Manual Deployment (VPS without Docker)

If you prefer running Node.js processes directly (using PM2):

1.  **Install Node.js, MongoDB, and Redis** on the server.
2.  **Clone the repo.**
3.  **Install dependencies:** `npm run install-all`
4.  **Build the Client:**
    ```bash
    cd client
    npm run build
    ```
    Serve the `client/dist` folder using Nginx.
5.  **Start Backend Services with PM2:**
    ```bash
    npm install -g pm2
    pm2 start server/api-gateway/index.js --name gateway
    pm2 start server/auth-service/src/index.js --name auth-service
    pm2 start server/quiz-service/src/index.js --name quiz-service
    pm2 start server/assessment-service/src/index.js --name assessment-service
    pm2 start server/reporting-service/src/index.js --name reporting-service
    pm2 save
    pm2 startup
    ```

## 5. SSL / HTTPS

Secure your application using **Let's Encrypt** and **Certbot**.

*   If using Docker + Nginx proxy, configure Certbot to auto-renew certificates.
*   If using AWS/Heroku, use their managed SSL services.

## 6. Database Migration / Seeding

On the first deployment, remember to seed the initial Admin user:

```bash
# If using Docker
docker-compose exec auth-service node ../../seedAdmin.js

# If using Manual/PM2, run from root
node seedAdmin.js
```

## 7. Monitoring

*   Check logs: `docker-compose logs -f` or `pm2 logs`
*   Monitor resource usage (RAM/CPU) to ensure your VPS is sized correctly.
