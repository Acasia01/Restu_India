# Restu India — Coolify One-Click Deployment Guide

This guide describes how to deploy the entire **Restu India** stack (React frontend, Node.js backend, MongoDB database) as a unified service on **Coolify** using the root `docker-compose.yml` file.

---

## 1. Prerequisites
1. A VPS with **Ubuntu 22.04 LTS** (At least 2GB or 4GB RAM is highly recommended).
2. Coolify installed on the VPS. If not installed, run this on your VPS via SSH:
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
3. Your DNS records pointed to your VPS IP:
   - `yourdomain.com` → `VPS_IP`
   - `api.yourdomain.com` → `VPS_IP`

---

## 2. Deploying on Coolify Dashboard

### Step 1: Add a Docker Compose Resource
1. Log in to your Coolify dashboard (usually `http://<VPS_IP>:8000`).
2. Go to **Projects** -> Select or Create a Project -> Select **Production** environment.
3. Click **+ Add Resource** -> select **Docker Compose**.
4. Choose your source:
   - **GitHub Repository**: Link your GitHub repository. Coolify will auto-detect the root `docker-compose.yml` and redeploy on every Git Push!
   - **Raw Compose**: Paste the contents of the root `docker-compose.yml` directly.

### Step 2: Configure Service Domains
Once Coolify parses the compose file, you will see a list of services: `mongodb`, `backend`, and `frontend`.

1. Click on the **frontend** service:
   - In the **Domains** field, enter your main website URL, for example:
     `https://yourdomain.com`
   - Coolify will automatically configure the SSL certificate (HTTPS) and routing.
2. Click on the **backend** service:
   - In the **Domains** field, enter your API URL, for example:
     `https://api.yourdomain.com`
   - Coolify will handle HTTPS routing for the backend API.

---

## 3. Environment Variables & Build Args

To connect the frontend to the backend and secure your app, set the following configurations:

### A. Frontend Build Arguments (Vite API Connection)
Since Vite compiles variables during the build phase, you must pass the API URL as a Build Argument:
1. Click on the **frontend** service in Coolify.
2. Find the **Build Arguments** section.
3. Add:
   - Key: `VITE_API_URL`
   - Value: `https://api.yourdomain.com/api` (Replace with your actual backend API domain)

### B. Backend Environment Variables
1. Click on the **backend** service in Coolify.
2. Under the **Environment Variables** section, add:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGO_URI` = `mongodb://mongodb:27017/restu_india` (Keep this as-is, `mongodb` points to the internal container)
   - `JWT_SECRET` = `<generate a secure random string>`
   - `ALLOWED_ORIGINS` = `https://yourdomain.com` (Your frontend domain)
   - `ADMIN_EMAIL` = `admin@yourdomain.com`
   - `ADMIN_PASSWORD` = `<your_secure_admin_password>`

---

## 4. Run Initial Database Seed (First Time Setup)
The backend requires initial data (categories, initial admin user, etc.) to function.
1. In the Coolify dashboard, click on the **backend** service.
2. Go to the **Terminal** tab of the running container.
3. Execute the seed command directly inside the container terminal:
   ```bash
   npm run seed
   ```
4. This will populate your MongoDB database.

---

## 5. Storage Persistence (Automatic)
The root `docker-compose.yml` file is configured with persistent volumes:
* `mongodb_data`: Saves all MongoDB database records.
* `uploads_data`: Saves all uploaded product images (`/usr/src/app/src/uploads`).

Even when you update the code or restart the container, **your database and product images will remain safe**.

---

## 6. Updating Your App
* If you connected your GitHub repository, simply push to the branch. Coolify will pull the changes, rebuild the Docker images, and deploy them with **zero downtime**.
* If you pasted the raw docker-compose file, click **Redeploy** on the dashboard.
