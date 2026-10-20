# TypingTest Live Competition (Multiplayer Classroom Edition)

**Language / Bahasa:** [ Bahasa Indonesia ](README.md) | **[ English ]**

A web-based typing speed competition application combining the modern aesthetics of **Monkeytype** with the real-time racing mechanics of **TypeRacer**. Built specifically for computer classrooms, schools, and educational workshops without requiring student registrations, emails, or SSO.

---

## Key Features

- **Teacher / Projector Screen (`/result`)**:
  - Visiting `/result` immediately presents the teacher with the **New Competition Setup** form (Session ID input, **Randomize Code** button, and duration selection: 1m, 2m, **3m default**, 5m).
  - High-impact projector display titled ***TypingTest Live Competition*** featuring synchronized 3-2-1 countdowns, animated TypeRacer car lanes, and an automated top 3 podium (Gold, Silver, Bronze).
  - Robust and flexible **Copy Link** button that works on any domain or LAN IP (e.g., `http://192.168.0.200:3002` or `https://domain.com`).
- **3-Minute Competition & Best WPM (Highest Score) Ranking**:
  - Default competition duration is extended to **3 minutes (180 seconds)**.
  - Students finishing a passage early can immediately press **Enter** or click *"Type Next Round"* to replay passages as long as time remains.
  - The projector leaderboard automatically tracks and ranks students by their **Highest WPM (Best Score)** across all attempts.
- **Student Screen (`/race`)**:
  - Students simply enter their Full Name & Session ID (e.g. `908235`). Zero account logins, emails, or SSO required.
- **Real-time Synchronization**:
  - Powered by low-latency WebSockets for instant progress and WPM updates every second.
- **Lightweight & Database-Free**:
  - Standalone in-memory backend without MongoDB or Redis dependencies for classroom race sessions.
- **Node.js 24 LTS Ready**:
  - Fully optimized and tested on Node.js version 24 LTS.

---

## Classroom Operational Guide

### A. For Teacher / Competition Administrator
1. **Create Competition Session**:
   - Open a browser on the teacher's PC and navigate to:
     ```text
     http://localhost:3002/result
     (or https://your-domain.com/result)
     ```
   - Enter a **Session ID** (or click **Randomize Code** for a random 6-digit code).
   - Select the **Competition Duration** (default: **3 Minutes**).
   - Click **Open Competition Room (Projector)**.
2. **Display on Projector / Smart TV**:
   - Project the browser tab onto the classroom screen.
   - Click the **Fullscreen** button in the top right corner.
3. **Share Link / Session Code with Students**:
   - Click **Copy Link** to share the student link, or direct students to open `/race` on their computers and enter the session code shown on the projector.
4. **Start the Race**:
   - Monitor the list of joined students on the race tracks.
   - Once all students have joined the lobby, click **Start Race**. A synchronized 3-2-1 countdown begins across all devices.
5. **After the Race**:
   - The competition concludes when time expires. The podium highlights the 1st (Gold), 2nd (Silver), and 3rd (Bronze) place champions.
   - Click **Rematch** to start another round with a new random passage.

---

### B. For Students
1. **Join the Competition**:
   - Open your browser and navigate to:
     ```text
     http://<teacher-ip>:3002/race
     (or the link provided by the teacher)
     ```
   - Enter your **Full Name** and the **Session ID** displayed on the projector.
   - Click **Join Race**.
2. **Wait in Lobby**:
   - Wait for the teacher to start the race. Place your fingers on the *home row* keys (ASDF JKL;).
3. **Type & Repeat for Best Score**:
   - Type the displayed passage as quickly and accurately as possible.
   - If you finish typing the paragraph before the 3-minute timer ends, press **Enter** to start the next round!
   - Your score on the podium will be your **Highest WPM (Best Score)** among all rounds.

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
- Teacher / Projector Setup: [http://localhost:3002/result](http://localhost:3002/result)
- Student View: [http://localhost:3002/race](http://localhost:3002/race)

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

Run both services (Backend and Frontend) in the background with PM2:

```bash
cd /var/www/typingtest

# 1. Start Backend Race WebSocket Server (Port 5005)
pm2 start "node backend/node_modules/tsx/dist/cli.mjs backend/src/race/standalone-server.ts" --name "typingtest-race"

# 2. Start Frontend Web Server (Port 3002)
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

## 4. Pure NGINX Reverse Proxy Configuration

In this setup, NGINX **does not serve static files directly**, acting strictly as a **Reverse Proxy Gateway**. Advantages:
- The frontend runs locally on port `3002` and can be tested independently.
- NGINX can be hosted on the same server **or on a separate reverse proxy/load balancer machine**.

### Create NGINX Configuration

```bash
sudo nano /etc/nginx/sites-available/typingtest
```

Paste the following configuration:

```nginx
# -------------------------------------------------------------
# Upstream Definitions
# - Same server: use 127.0.0.1
# - Different server: replace with the application server IP
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

    # Gzip compression for fast asset delivery
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # 1. Reverse Proxy WebSocket Race Endpoint (/ws/)
    location /ws/ {
        proxy_pass http://typingtest_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Long timeout so student WebSockets do not drop
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 2. Reverse Proxy REST API Endpoints (/configuration, /health)
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

### Free SSL (HTTPS / WSS) with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 5. Configurations (Ads, Database, and .env)

### A. Ad-Free by Default
- Default setting in `frontend/src/ts/constants/default-config.ts` is permanently:
  ```ts
  ads: "off"
  ```
- Neither students nor teachers will ever see advertisement placeholders, banners, or third-party trackers.

### B. Database (Zero-Dependency In-Memory Architecture)
- **Classroom Race Server (`standalone-server.ts`)**:
  - Runs **100% in-memory**. Sessions, WebSocket connections, and real-time leaderboards live in RAM.
  - **No MongoDB or Redis installation required.** Very minimal resource footprint (< 60MB RAM) with zero database maintenance.

### C. Environment Files (`.env`)
Backend `.env`:
```env
# backend/.env
PORT=5005
NODE_ENV=production
```
Frontend:
No `.env` required since NGINX reverse-proxies `/ws/` and `/configuration` directly to the backend.

---

## 6. Testing & Verification

1. **Direct Access (Local / LAN)**:
   - Teacher / Projector Setup: `http://localhost:3002/result`
   - Student Screen: `http://localhost:3002/race`
2. **Public Access (via NGINX)**:
   - Teacher / Projector Setup: `https://your-domain.com/result`
   - Student Screen: `https://your-domain.com/race`
3. Click **Open Competition Room** on the teacher's screen, share the session code with students, and click **Start Race**. The 3-2-1 countdown and typing arena will synchronize in real-time across all devices!
