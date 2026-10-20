# TypingTest Multiplayer (Classroom Edition)

**Language / Bahasa:** [ Bahasa Indonesia ](README.md) | **[ English ]**

A web-based typing speed competition application combining the modern aesthetics of **Monkeytype** with the real-time racing mechanics of **TypeRacer**. Built specifically for computer classrooms and educational competitions without requiring student registrations, emails, or SSO.

---

## Key Features

- **Student Screen (`/race`)**: Students simply enter their Full Name & Session ID (e.g., `908235`). No login, email, or SSO required.
- **Teacher / Projector Screen (`/result<sessionId>`)**: Wide-screen display designed for projectors featuring synchronized 3-2-1 countdowns, animated real-time vehicle/rocket race tracks, podium ranking (Gold, Silver, Bronze), and celebration confetti.
- **Indonesian Texts & 60s Mode**: Curated inspirational and educational quotes in Indonesian with a 60-second competition countdown.
- **Real-time Synchronization**: Low-latency WebSockets for instant progress and WPM updates.
- **Lightweight & Fast**: Standalone in-memory backend without external database dependencies (MongoDB/Redis) for classroom race sessions.
- **Node.js 24 Ready**: Fully optimized and verified on Node.js version 24 LTS.

---

## Architecture & Ports

| Component | Port | Description |
|---|---|---|
| **Frontend Web** | `3002` | SolidJS (`.tsx`) + TailwindCSS UI (Dev or Production Preview) |
| **Backend Race Server** | `5005` | WebSocket `ws://.../ws/race` + Mock REST API (`0.0.0.0`) |
| **NGINX Reverse Proxy** | `80` / `443` | Reverse proxy gateway (On the same server or a dedicated server) |

---

## 1. Local Development Mode

### Prerequisites
- **Node.js** v24.x LTS (v24.0.0 or later recommended)
- **pnpm** v11.x or v12.x

### Automated Launcher (Windows)
Run one of the launcher scripts in the root directory:
- `jalankan-typingtest.bat` *(Double-click)*
- or `./jalankan-typingtest.ps1`

### Manual Run via Terminal
**Terminal 1 (Backend Race Server):**
```powershell
node backend/node_modules/tsx/dist/cli.mjs backend/src/race/standalone-server.ts
```

**Terminal 2 (Frontend Web):**
```powershell
cd frontend
node node_modules/vite/bin/vite.js dev
```

Open in browser:
- Teacher / Projector View: [http://localhost:3002/result908235](http://localhost:3002/result908235)
- Student View: [http://localhost:3002/race?session=908235](http://localhost:3002/race?session=908235)

---

## 2. Local Production Testing (Without NGINX)

You can test the production build directly on your local computer before setting up a reverse proxy:

```bash
# 1. Build all packages & frontend
pnpm --filter="./packages/*" run build
cd frontend && pnpm run build && cd ..

# 2. Run Backend Race Server (Terminal 1)
pnpm run race-server

# 3. Run Frontend Production Server (Terminal 2)
pnpm run preview-frontend
```

The frontend will run at `http://localhost:3002` (or `http://<your-ip>:3002`). You can immediately verify production performance and WebSocket synchronization without installing NGINX first.

---

## 3. Production & Deployment on Linux Server (ARM64 / x86_64)

The application architecture is 100% compatible with **Linux ARM64 / aarch64** (such as AWS Graviton, Oracle Cloud Ampere A1, Raspberry Pi 4/5, Ampere Altra servers) as well as **x86_64** servers.

### Step 1: Prepare Linux Server (Node.js 24 LTS)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential dependencies, NGINX, and Git
sudo apt install -y curl git build-essential nginx

# Install Node.js 24 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js version
node -v           # Ensure v24.x.x
npm -v

# Enable pnpm & install PM2
sudo corepack enable
sudo npm install -g pnpm pm2
```

### Step 2: Clone & Build Project

```bash
# Prepare web directory
sudo mkdir -p /var/www/typingtest
sudo chown -R $USER:$USER /var/www/typingtest

cd /var/www/typingtest
git clone <YOUR_REPOSITORY_URL> .

# Install all monorepo dependencies
pnpm install --frozen-lockfile

# Build internal packages & frontend
pnpm --filter="./packages/*" run build
cd frontend && pnpm run build && cd ..
```

### Step 3: Run Production Services with PM2

Run both services (Backend and Frontend) in the background using PM2:

```bash
cd /var/www/typingtest

# 1. Run Backend Race WebSocket Server (Port 5005)
pm2 start "node backend/node_modules/tsx/dist/cli.mjs backend/src/race/standalone-server.ts" --name "typingtest-race"

# 2. Run Frontend Web Server (Port 3002)
pm2 start "pnpm --filter @monkeytype/frontend run start" --name "typingtest-frontend"

# Save process list to auto-start on server reboot
pm2 save
pm2 startup
```

Monitoring commands:
```bash
pm2 status
pm2 logs
```

---

## 4. NGINX Pure Reverse Proxy Configuration

In this architecture, NGINX **does not serve static files directly from disk**. Instead, it functions purely as a **Reverse Proxy Gateway**. Benefits:
- The frontend process runs actively on port `3002` and remains testable locally.
- NGINX can be hosted on the same server **or on a completely separate server** (e.g., NGINX edge gateway/load balancer on Server A, app running on Server B).

### Create NGINX Configuration

```bash
sudo nano /etc/nginx/sites-available/typingtest
```

Paste the following configuration:

```nginx
# -------------------------------------------------------------
# Upstream Application Definitions
# - If NGINX is on the SAME server: use 127.0.0.1
# - If NGINX is on a SEPARATE server: replace with the application server IP
# -------------------------------------------------------------
upstream typingtest_frontend {
    server 127.0.0.1:3002;
    keepalive 32;
}

upstream typingtest_backend {
    server 127.0.0.1:5005;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com; # Replace with your domain or server public IP

    # Gzip compression for fast transfer
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # 1. Reverse Proxy WebSocket (/ws/)
    location /ws/ {
        proxy_pass http://typingtest_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Generous timeout so student connections do not drop mid-session
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 2. Reverse Proxy REST API Backend (/configuration, /health)
    location ~ ^/(configuration|health) {
        proxy_pass http://typingtest_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 3. Reverse Proxy Frontend Web (Port 3002)
    location / {
        proxy_pass http://typingtest_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}
```

Enable configuration & reload NGINX:
```bash
sudo ln -s /etc/nginx/sites-available/typingtest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Free SSL Setup (HTTPS / WSS) with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```
Certbot will automatically update the NGINX configuration to port 443 and redirect all HTTP/WS traffic to HTTPS/WSS.

---

## 5. Specific Configurations (Ads, Database, and .env)

### A. Ad-Free by Default
- Default setting in `frontend/src/ts/constants/default-config.ts` has been permanently set to:
  ```ts
  ads: "off"
  ```
- Students and teachers will not see advertisement banners, donation boxes, or third-party trackers.

### B. Database (Zero-Dependency In-Memory Architecture)
- **Classroom Competition Mode (`standalone-server.ts`)**:
  - Runs **100% in-memory**. All competition sessions, WebSocket traffic, and student leaderboards are processed instantly in RAM.
  - **No MongoDB or Redis installation is required.** Memory usage remains negligible (< 60MB RAM) with zero database maintenance.

### C. Environment Files (`.env`)
For backend:
```env
# backend/.env
PORT=5005
NODE_ENV=production
```
For frontend:
No additional `.env` file is required because NGINX handles the reverse proxying of `/ws/` and `/configuration` to the backend.

---

## 6. Testing & Verification

1. **Direct Access (Local / Internal Network)**:
   - Teacher Projector: `http://localhost:3002/result908235`
   - Student Screen: `http://localhost:3002/race?session=908235`
2. **Public Access (via NGINX)**:
   - Teacher Projector: `https://your-domain.com/result908235`
   - Student Screen: `https://your-domain.com/race?session=908235`
3. Click **Gabung Lomba** (Join Race) on the student tab, then click **Mulai Lomba** (Start Race) on the teacher screen. The 3-2-1 countdown and typing arena will synchronize in real-time!
