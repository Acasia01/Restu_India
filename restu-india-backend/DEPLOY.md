# Restu India — Hostinger VPS Deployment Guide

## What you get
- Node.js + Express backend (replaces Django)
- MongoDB database
- Nginx reverse proxy with HTTPS (Let's Encrypt)
- PM2 process manager (auto-restart, clustering)
- All original API endpoints preserved — frontend works as-is

---

## 1. Provision the VPS (Hostinger panel)

1. In Hostinger, create a VPS with **Ubuntu 22.04 LTS**.
2. Note your server's public IP (e.g. `123.45.67.89`).
3. Point your domain DNS:
   - `A  restuindia.in  → 123.45.67.89`
   - `A  www.restuindia.in  → 123.45.67.89`
   Wait for DNS propagation (up to 30 min).

---

## 2. Initial server setup (SSH as root)

```bash
ssh root@YOUR_VPS_IP

# Create a non-root deploy user
adduser deploy
usermod -aG sudo deploy
# Copy your SSH key to the new user
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Harden SSH — disable root login and password auth
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# UFW firewall — allow only SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Log in as deploy for all remaining steps
su - deploy
```

---

## 3. Install Node.js, MongoDB, Nginx, PM2

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB 7.0
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod

# Nginx
sudo apt-get install -y nginx
sudo systemctl enable nginx

# PM2 globally
sudo npm install -g pm2
pm2 startup systemd -u deploy --hp /home/deploy | tail -n 1 | sudo bash
```

---

## 4. Deploy the backend

```bash
# Create deployment directory
sudo mkdir -p /var/www/restu-india-backend
sudo mkdir -p /var/log/restu-india
sudo chown -R deploy:deploy /var/www/restu-india-backend /var/log/restu-india

# Upload backend files (run this from your LOCAL machine)
# scp -r ./restu-india-backend deploy@YOUR_VPS_IP:/var/www/

# On the VPS:
cd /var/www/restu-india-backend
npm install --omit=dev

# Create the .env file from the example
cp .env.example .env
nano .env
# Fill in: MONGO_URI, JWT_SECRET, ALLOWED_ORIGINS, ADMIN_EMAIL, ADMIN_PASSWORD, NODE_ENV=production
```

**Required .env values:**
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/restu_india
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://restuindia.in,https://www.restuindia.in
ADMIN_EMAIL=admin@restuindia.in
ADMIN_PASSWORD=<a strong password>
MAX_FILE_SIZE_MB=5
```

```bash
# Seed the database (first time only)
npm run seed

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save

# Verify it's running
pm2 status
curl http://127.0.0.1:5000/api/health
```

---

## 5. Deploy the React frontend

```bash
# On your LOCAL machine — build the frontend
cd restu-india   # the React project
echo "VITE_API_URL=https://restuindia.in/api" > .env.production
npm run build

# Upload the dist folder
scp -r dist deploy@YOUR_VPS_IP:/var/www/restu-india-frontend/
```

---

## 6. Configure Nginx

```bash
# On the VPS
sudo cp /var/www/restu-india-backend/nginx.conf /etc/nginx/sites-available/restuindia.in
sudo ln -s /etc/nginx/sites-available/restuindia.in /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # remove default site

sudo nginx -t   # test config — must say "ok"
sudo systemctl reload nginx
```

---

## 7. HTTPS with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d restuindia.in -d www.restuindia.in

# Auto-renewal is set up automatically. Verify:
sudo certbot renew --dry-run
```

---

## 8. Secure MongoDB (production hardening)

```bash
# Create a MongoDB user for the app
mongosh
> use admin
> db.createUser({ user: "restuAdmin", pwd: "<strongPassword>", roles: ["userAdminAnyDatabase"] })
> use restu_india
> db.createUser({ user: "restuApp", pwd: "<appPassword>", roles: [{ role: "readWrite", db: "restu_india" }] })
> quit()

# Enable auth in MongoDB config
sudo nano /etc/mongod.conf
# Add under 'security':
#   security:
#     authorization: enabled

sudo systemctl restart mongod

# Update .env MONGO_URI to include credentials:
# MONGO_URI=mongodb://restuApp:<appPassword>@localhost:27017/restu_india
```

---

## 9. Verify everything

```bash
# API health
curl https://restuindia.in/api/health

# Categories (should return JSON array)
curl https://restuindia.in/api/categories

# Products
curl https://restuindia.in/api/products

# PM2 logs
pm2 logs restu-india-api --lines 50
```

---

## Day-to-day operations

```bash
# Restart backend
pm2 restart restu-india-api

# View logs
pm2 logs restu-india-api

# Zero-downtime reload
pm2 reload restu-india-api

# Deploy new frontend build (from local machine)
npm run build
scp -r dist deploy@YOUR_VPS_IP:/var/www/restu-india-frontend/
```

---

## Security summary

| Layer | Measure |
|-------|---------|
| SSH | Root login disabled, key-only auth |
| Firewall | UFW: only ports 22, 80, 443 |
| HTTPS | Let's Encrypt TLS, HSTS header |
| Headers | X-Frame-Options, CSP, nosniff via Helmet + Nginx |
| Rate limits | Auth: 20/15min · API: 120/min · Enquiry: 5/10min |
| Passwords | Bcrypt (12 rounds) |
| Auth | JWT, expires in 7 days |
| Uploads | Type + size validation, no script execution in uploads dir |
| MongoDB | Auth-enabled, local-only bind (no public port) |
| PM2 | Cluster mode, auto-restart on crash |
