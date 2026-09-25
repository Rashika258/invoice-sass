# 🚀 Billora ERP SaaS — Production Deployment Guide

This guide covers production deployment strategies for **Billora**, including Vercel + Managed Postgres, Docker Compose VPS deployment, and self-hosted Linux server setups with Nginx & Systemd/PM2.

---

## 📋 Table of Contents
1. [Environment Variables Reference](#-environment-variables-reference)
2. [Option 1: Vercel + Supabase / Managed PostgreSQL (Recommended)](#option-1-vercel--supabase--managed-postgresql-recommended)
3. [Option 2: Docker Compose on VPS (DigitalOcean / AWS EC2 / Hetzner)](#option-2-docker-compose-on-vps-digitalocean--aws-ec2--hetzner)
4. [Option 3: Self-Hosted PM2 + Nginx Reverse Proxy](#option-3-self-hosted-pm2--nginx-reverse-proxy)
5. [Database Migrations & Seeding](#-database-migrations--seeding)
6. [Post-Deployment Verification](#-post-deployment-verification)

---

## 🔑 Environment Variables Reference

Create a `.env` file on your production host with the following variables:

```env
# Required Core Configuration
NODE_ENV="production"
DATABASE_URL="postgresql://username:password@your-db-host:5432/invoice_db?schema=public&sslmode=require"
AUTH_SECRET="generate-a-64-char-random-secure-secret-key"
NEXT_PUBLIC_APP_NAME="Billora OS"
APP_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Optional: Google OAuth 2.0
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: Payment Gateway (Razorpay)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
RAZORPAY_WEBHOOK_SECRET="your-razorpay-webhook-secret"

# Optional: AI OCR & Business Insights
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxx"
GEMINI_API_KEY="AIzaSyxxxxxxxxxxxx"
```

---

## Option 1: Vercel + Supabase / Managed PostgreSQL (Recommended)

### Step 1: Provision Managed PostgreSQL Database
1. Create a database instance on **Supabase**, **Neon**, **Aiven**, or **Vercel Postgres**.
2. Obtain your pooled connection string URL (e.g., `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:6543/postgres?pgbouncer=true`).

### Step 2: Deploy to Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Configure **Environment Variables** in Vercel project settings (`DATABASE_URL`, `AUTH_SECRET`, `APP_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
3. Set Build Command:
   ```bash
   npx prisma generate && npx prisma db push && next build
   ```
4. Click **Deploy**.

---

## Option 2: Docker Compose on VPS (DigitalOcean / AWS EC2 / Hetzner)

### Step 1: Provision Server
- OS: Ubuntu 22.04 LTS / 24.04 LTS (2 vCPU, 4GB RAM minimum).
- Open ports: `80` (HTTP), `443` (HTTPS), `22` (SSH).

### Step 2: Install Docker & Docker Compose
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

### Step 3: Clone Repository & Run Docker
```bash
git clone https://github.com/Rashika258/invoice-sass.git
cd invoice-saas

# Start web application and PostgreSQL containers
docker compose up -d --build

# Run database migrations inside web container
docker exec -it billora-web npx prisma db push
```

---

## Option 3: Self-Hosted PM2 + Nginx Reverse Proxy

### Step 1: Node.js & PM2 Setup
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2
```

### Step 2: Build Application
```bash
cd /var/www/invoice-saas
npm ci
npx prisma generate
npx prisma db push
npm run build
```

### Step 3: Start with PM2
```bash
pm2 start npm --name "billora-web" -- start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx Site
Create `/etc/nginx/sites-available/billora`:
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and HTTPS via Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/billora /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🗄️ Database Migrations & Seeding

Run database schema pushes and initial data seeding:

```bash
# Push Prisma Schema to Production DB
npx prisma db push

# (Optional) Seed Default System Ledgers & Categories
npm run seed:all
```

---

## 🩺 Post-Deployment Verification

Verify production application health:

1. **Health Check Endpoint**:
   Visit `https://yourdomain.com/api/health` — should return `200 OK` with status `"ok"` and database ping latency.
2. **Google OAuth Callback**:
   Verify redirect URI `https://yourdomain.com/api/auth/google/callback` is registered in Google Cloud Console.
3. **PWA Manifest**:
   Verify `https://yourdomain.com/manifest.json` loads correctly.
