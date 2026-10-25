# TypingTest Live Competition (Multiplayer Classroom Edition)

**Language / Bahasa:** [ Bahasa Indonesia ](README.md) | **[ English ]**

A web-based typing speed competition application combining the modern aesthetics of **Monkeytype** with the real-time racing mechanics of **TypeRacer**. Built specifically for computer classrooms, schools, and educational workshops without requiring student registrations, emails, or SSO.

---

## Key Features

- **Homepage Mode Switcher (`/`)**:
  - Visiting the homepage offers 3 immediate choices:
    - **Solo Practice Mode (Solo WPM Test)**: Classic single-player Monkeytype practice.
    - **Join Competition Arena**: Directs users to `/race` to join a session using their teacher's Session ID.
    - **Host Competition Room (Host / Teacher)**: Directs users to `/result` to create or host a new classroom race.
  - Quick action shortcut `🏆 Live Competition` in the top navigation bar.
- **Secure & Private Join Form (`/race`)**:
  - Competition sessions are strictly private by Session ID, preventing random users or other students from joining uninvited.
  - Students enter their **Full Name** and **Session ID** (6 digits) shown on the teacher's projector (or auto-filled when using a direct link).
- **Full Monkeytype-Style Difficulty & Mode Selector (`/result`)**:
  - **Modes**:
    - `time`: Flexible durations: 15s, 30s, 60s (1m), 120s (2m), **180s (3-minute default)**, **300s (5m)**, or **600s (10m)**.
    - `words`: Word target counts: 10, 25, 50, or 100 words.
    - `quote`: Authentic, inspirational, and educational quotes from real historical figures (Ki Hajar Dewantara, B.J. Habibie, Soekarno, Hatta, Einstein, Mandela, etc.) intelligently scaled in length to match the teacher's selected duration (15s to 10m). Each new round (*multi-attempt*) dynamically provides a fresh, distinct passage without repetitive text.
    - `custom`: Custom text or exercise paragraph provided by the teacher.
  - **Toggles**:
    - `@ punctuation`: Includes capitalization and punctuation (periods, commas).
    - `# numbers`: Injects random numbers into the text.
  - **Languages**:
    - `Bahasa Indonesia` (Default).
    - `English`.
- **Synchronized 3-2-1 Countdown & Server Timer Sync**:
  - Real animated **3... 2... 1...** countdown displayed simultaneously on both the projector and student screens.
  - Real-time 1-second server tick (`timer_sync`) broadcast across all clients via WebSocket.
  - **Anti-Cheat Timer Lock**: When the timer reaches zero, student typing input is strictly locked (`disabled`) and final rankings are instantly computed.
- **Multi-Attempt Competition & Best WPM Ranking**:
  - Students finishing a passage before time runs out can press **Enter** to type subsequent rounds to improve their speed.
  - The projector leaderboard ranks students based on their **Highest WPM (Best Score)** across all completed rounds.
- **Universal Copy Link**:
  - Works reliably across any domain, public IP, or local LAN IP (`http://192.168.x.x:3002`, `http://localhost:3002`, `https://yourdomain.com`).
- **Zero-Database Lightweight Architecture**:
  - Standalone in-memory backend without MongoDB or Redis.
- **Node.js 24 LTS Ready**:
  - Fully optimized and tested on Node.js version 24 LTS.

---

## Classroom Operational Guide

### A. For Teacher / Competition Administrator
1. **Open Competition Settings**:
   - Navigate to:
     ```text
     http://localhost:3002/result
     (or click "Buka Sesi Lomba (Host / Guru)" on the homepage)
     ```
   - Configure **Mode & Duration**: Choose flexible durations from **15s, 30s, 60s (1m), 120s (2m), 180s (3m default), 300s (5m), up to 600s (10m)**, or choose words/quote/custom exercise mode.
   - Adjust **Difficulty & Language**: Toggle **punctuation** (caps & symbols) and **numbers** as needed, and select **Bahasa Indonesia** or **English**.
   - Set a **Session ID** (or click **Randomize Code** for a fresh 6-digit code).
   - Click **Open Competition Room (Projector)**.
2. **Display on Projector / Smart TV**:
   - Project the browser tab onto the classroom display or Smart TV.
   - Click the **Fullscreen** button in the top right corner for full display view.
3. **Share Link / Session Code**:
   - Click **Copy Link** to copy the student URL (works seamlessly across LAN or online domains), or direct students to open `/race` on their computers and enter the 6-digit code.
4. **Start the Race**:
   - Monitor students connecting on the real-time TypeRacer track.
   - Once all students have joined, click **Start Race**. A synchronized 3-2-1 countdown begins on all screens.
5. **After the Race & Rematch**:
   - When time expires, typing is automatically locked on all student devices (*anti-cheat lock*). The podium awards 1st (Gold), 2nd (Silver), and 3rd (Bronze) based on **Highest WPM (Best Score)**.
   - Click **Rematch** to start another round with fresh text without having to recreate the session.

---

### B. For Students
1. **Join the Competition**:
   - Navigate to `http://<teacher-ip>:3002/race` on your device (or click **Gabung Arena Lomba** on the homepage).
   - Enter your **Full Name** and the **Session ID** (6 digits) shown on the teacher's projector (or auto-filled when opening a shared direct link).
   - Click **Gabung Arena (Join Arena)**.
2. **Wait in Lobby & Countdown**:
   - Wait in the lobby for the teacher to start the race.
   - When the animated countdown begins (**3... 2... 1...**), position your fingers on the *home row* keys (ASDF JKL;).
3. **Type & Repeat for Best Score**:
   - Type the passage as quickly and accurately as possible. Misspelled letters are highlighted in red.
   - The competition runs simultaneously for the teacher-selected duration (15s to 10 minutes).
   - **Multi-Attempt Feature**: If you finish typing the passage before time expires, immediately press **Enter** to start typing the next round!
   - Your highest score among all completed rounds will be your recorded **Best Score** on the podium.
   - When time runs out, typing is strictly locked and your final ranking is displayed.

---

## Architecture & Ports

| Component | Port / Protocol | Description |
|---|---|---|
| **Frontend Web** | `3002 (HTTP)` | SolidJS (`.tsx`) + TailwindCSS UI (Internal Server) |
| **Backend Race Server** | `5005 (HTTP/WS)` | WebSocket `ws://.../ws/race` + Mock REST API (`0.0.0.0`) |
| **NGINX Reverse Proxy (HTTP)** | `80 (TCP)` | Automatic 301 Permanent Redirect to HTTPS |
| **NGINX Gateway (HTTPS)** | `443 (TCP / UDP)` | **Mandatory HTTPS**: Supports **HTTP/2** (TCP) & **HTTP/3 QUIC** (UDP) + WSS |

---

## 1. Local Development Mode

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

Browser URLs:
- Homepage: [http://localhost:3002](http://localhost:3002)
- Teacher / Projector Setup: [http://localhost:3002/result](http://localhost:3002/result)
- Student View: [http://localhost:3002/race](http://localhost:3002/race)

---

## 2. Local Production Testing (Standalone without NGINX)

You can preview the compiled production build locally before setting up a reverse proxy:

```bash
# 1. Build all packages & frontend
pnpm --filter="./packages/*" run build
cd frontend && pnpm run build && cd ..

# 2. Run Backend Race Server (Terminal 1)
pnpm run race-server

# 3. Run Frontend Production Server (Terminal 2)
pnpm run preview-frontend
```

Frontend will be available at `http://localhost:3002` (or your LAN IP `http://<your-ip>:3002`).

---

## 3. Production Deployment on Linux Servers (ARM64 / x86_64)

This architecture is 100% compatible with **Linux ARM64 / aarch64** (e.g. AWS Graviton, Oracle Cloud Ampere A1, Raspberry Pi 4/5, Ampere Altra) and standard **x86_64** servers.

### Step 1: Server Setup (Node.js 24 LTS)

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install basic tools, NGINX, Certbot (SSL), and Git
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx

# Install Node.js 24 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js version
node -v           # Must be v24.x.x
npm -v

# Enable pnpm and install PM2
sudo corepack enable
sudo npm install -g pnpm pm2

# Configure Firewall (Allow TCP 80, TCP 443, and UDP 443 for HTTP/3 QUIC)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
```

### Step 2: Clone & Build Project

```bash
# Create and prepare web directory
sudo mkdir -p /var/www/typingtest
sudo chown -R $USER:$USER /var/www/typingtest

cd /var/www/typingtest
git clone <YOUR_REPOSITORY_URL> .

# Install monorepo dependencies
pnpm install --frozen-lockfile

# Build internal packages & frontend
pnpm --filter="./packages/*" run build
cd frontend && pnpm run build && cd ..
```

### Step 3: Run Services with PM2

Run both services in the background using PM2:

```bash
cd /var/www/typingtest

# 1. Start Backend Race WebSocket Server (Port 5005)
pm2 start "node backend/node_modules/tsx/dist/cli.mjs backend/src/race/standalone-server.ts" --name "typingtest-race"

# 2. Start Frontend Web Server (Port 3002)
pm2 start "pnpm --filter @monkeytype/frontend run start" --name "typingtest-frontend"

# Persist processes across server reboots
pm2 save
pm2 startup
```

---

## 4. NGINX Reverse Proxy Setup (Mandatory HTTPS, HTTP/2, & HTTP/3 QUIC)

In production, NGINX acts as a **Secure Reverse Proxy Gateway** enforcing SSL/TLS encryption, automatic HTTP-to-HTTPS redirect, and acceleration with **HTTP/2** (TCP) and **HTTP/3** (QUIC over UDP).

### Step 4A: Obtain a Free SSL Certificate (Let's Encrypt)
Ensure your domain (e.g. `typing.myschool.edu`) points to your server's public IP address, then run:

```bash
sudo certbot certonly --nginx -d your-domain.com
```

### Step 4B: Install NGINX Configuration File
Create `/etc/nginx/sites-available/typingtest`:

```nginx
# Upstream to internal backend & frontend services
upstream typingtest_frontend {
    server 127.0.0.1:3002;
    keepalive 32;
}

upstream typingtest_backend {
    server 127.0.0.1:5005;
    keepalive 32;
}

# 1. HTTP Server - Automatic 301 Permanent Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    # Redirect all plain HTTP traffic directly to HTTPS
    return 301 https://$host$request_uri;
}

# 2. HTTPS Server - HTTP/2 & HTTP/3 (QUIC)
server {
    # Port 443 TCP: HTTPS & HTTP/2
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    # Port 443 UDP: HTTP/3 (QUIC)
    listen 443 quic reuseport;
    listen [::]:443 quic reuseport;
    http3 on;
    quic_retry on;

    server_name your-domain.com;

    # SSL/TLS Certificate Paths
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Modern TLS Security Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HTTP/3 Advertisement Header for Browsers (Chrome, Edge, Firefox, Safari)
    add_header Alt-Svc 'h3=":443"; ma=86400' always;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Location 1: Real-time Race WebSocket (WSS)
    location /ws/ {
        proxy_pass http://typingtest_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Location 2: REST API & Backend Health
    location ~ ^/(configuration|health) {
        proxy_pass http://typingtest_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Location 3: Frontend Web Application (SolidJS)
    location / {
        proxy_pass http://typingtest_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_buffering off;
    }
}
```

> **NGINX Compatibility Notes**:
> - The `http2 on;` directive is supported in NGINX $\ge 1.25.1$. On older NGINX versions ($< 1.25.1$), use `listen 443 ssl http2;`.
> - HTTP/3 (QUIC) operates over **UDP port 443**. Ensure your cloud security groups / firewall (AWS Security Group, GCP Firewall, Oracle Cloud Security List) have opened **UDP port 443**.
> - HTTPS is strictly required for full Clipboard API support (`Copy Link`) and secure WebSocket (`wss://`) across all modern browsers.

### Step 4C: Enable Configuration & Reload NGINX
```bash
sudo ln -s /etc/nginx/sites-available/typingtest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
