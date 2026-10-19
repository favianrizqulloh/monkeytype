# TypingTest Multiplayer (Classroom Edition)

Aplikasi perlombaan mengetik cepat (typing speed competition) berbasis web yang mengadopsi tampilan modern **Monkeytype** dan antarmuka balapan real-time **TypeRacer**. Dirancang khusus untuk kelas komputer sekolah/edukasi tanpa mewajibkan registrasi, email, atau SSO bagi murid.

---

## Fitur Utama

- **Layar Murid (`/race`)**: Cukup masukkan Nama Lengkap & ID Sesi (misal `908235`). Tanpa login/email/SSO.
- **Layar Guru / Proyektor (`/result<sessionId>`)**: Tampilan layar lebar untuk proyektor dengan countdown bersama 3-2-1, live race tracks animasi mobil/roket, podium juara 1, 2, 3 (Emas, Perak, Perunggu), dan efek konfeti selebrasi.
- **Bahasa & Mode Lomba**: Menggunakan teks kutipan inspiratif & edukatif Bahasa Indonesia dengan batas waktu 60 detik.
- **Real-time Synchronization**: Menggunakan WebSocket ultra-low latency untuk update progres dan WPM.
- **Ringan & Cepat**: Backend standalone mandiri tanpa ketergantungan database eksternal (MongoDB/Redis) untuk mode kelas lomba.

---

## Arsitektur & Port

| Komponen | Port | Deskripsi |
|---|---|---|
| **Frontend Web** | `3000` (Dev) / `80` & `443` (Prod via Nginx) | SolidJS (`.tsx`) + TailwindCSS UI |
| **Backend Race Server** | `5005` | WebSocket `ws://.../ws/race` + Mock REST API |

---

## 1. Menjalankan di Mode Development (Lokal)

### Prasyarat
- **Node.js** LTS (v20+ atau v24+)
- **pnpm** (v9+ atau v12+)

### Cara Otomatis (Windows)
Cukup jalankan file batch atau PowerShell berikut di root direktori:
- `jalankan-typingtest.bat` *(Double-click)*
- atau `./jalankan-typingtest.ps1`

### Cara Manual via Terminal
**Terminal 1 (Backend Race Server):**
```powershell
node backend/node_modules/tsx/dist/cli.mjs backend/src/race/standalone-server.ts
```

**Terminal 2 (Frontend Web):**
```powershell
cd frontend
node node_modules/vite/bin/vite.js dev
```

Buka di browser:
- Layar Guru / Proyektor: [http://localhost:3000/result908235](http://localhost:3000/result908235)
- Layar Murid: [http://localhost:3000/race?session=908235](http://localhost:3000/race?session=908235)

---

## 2. Panduan Production Ready & Deployment di Linux Server (ARM64)

Arsitektur aplikasi ini 100% kompatibel dengan prosesor **Linux ARM64 / aarch64** (seperti AWS Graviton, Oracle Cloud Ampere A1, Raspberry Pi 4/5, server Ampere Altra, dll).

### Langkah 1: Persiapan Server Linux ARM64 (Ubuntu / Debian)

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Instal dependensi dasar, Nginx, dan Git
sudo apt install -y curl git build-essential nginx

# Instal Node.js 22 LTS ARM64 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi arsitektur & versi
uname -m          # Output: aarch64
node -v           # Output: v22.x.x

# Aktifkan pnpm & instal PM2
sudo corepack enable
sudo npm install -g pnpm pm2
```

### Langkah 2: Clone & Instal Dependensi Proyek

```bash
# Siapkan direktori web
sudo mkdir -p /var/www/typingtest
sudo chown -R $USER:$USER /var/www/typingtest

cd /var/www/typingtest
git clone <URL_REPOSITORY_ANDA> .

# Instal dependensi seluruh monorepo
pnpm install --frozen-lockfile
```

### Langkah 3: Build Monorepo & Frontend untuk Production

```bash
# 1. Build semua internal packages (schemas, contracts, util, dll)
pnpm --filter="./packages/*" run build

# 2. Build Frontend (menghasilkan static bundle di frontend/dist)
cd /var/www/typingtest/frontend
pnpm run build
cd /var/www/typingtest
```

Folder `frontend/dist` berisi file statis yang siap di-serve langsung oleh NGINX dengan efisiensi maksimal tanpa perlu menjalankan server Node.js untuk frontend di production.

---

## 3. Menjalankan Backend di Production

Pilih salah satu metode: **PM2** (paling mudah) atau **Systemd Service** (standar Linux).

### Opsi A: Menggunakan PM2 (Direkomendasikan)

```bash
cd /var/www/typingtest

# Jalankan server backend di latar belakang
pm2 start "node backend/node_modules/tsx/dist/cli.mjs backend/src/race/standalone-server.ts" --name "typingtest-race"

# Simpan agar otomatis menyala saat reboot server
pm2 save
pm2 startup
```

Perintah monitoring:
```bash
pm2 status
pm2 logs typingtest-race
```

### Opsi B: Menggunakan Systemd Service

Buat file service systemd:
```bash
sudo nano /etc/systemd/system/typingtest.service
```

Isi dengan:
```ini
[Unit]
Description=TypingTest Standalone Race WebSocket Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/typingtest
Environment=NODE_ENV=production
Environment=PORT=5005
ExecStart=/usr/bin/node /var/www/typingtest/backend/node_modules/tsx/dist/cli.mjs /var/www/typingtest/backend/src/race/standalone-server.ts
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Aktifkan service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable typingtest
sudo systemctl start typingtest
sudo systemctl status typingtest
```

---

## 4. Konfigurasi Reverse Proxy NGINX

Konfigurasi ini bertindak sebagai pintu gerbang utama:
1. Menyajikan aset statis frontend langsung dari `frontend/dist`.
2. Meneruskan koneksi WebSocket `/ws/` ke port backend `5005` dengan protocol upgrade.
3. Meneruskan REST API `/configuration` & `/health` ke backend port `5005`.
4. Menangani SPA routing (`try_files $uri $uri/ /index.html`).

### Langkah Buat Konfigurasi NGINX

```bash
sudo nano /etc/nginx/sites-available/typingtest
```

Tempel konfigurasi berikut:

```nginx
# Upstream ke Node.js Backend Race Server
upstream typingtest_backend {
    server 127.0.0.1:5005;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name domain-anda.com; # Ganti dengan domain atau IP publik server Anda

    # Lokasi folder build frontend
    root /var/www/typingtest/frontend/dist;
    index index.html;

    # Kompresi Gzip untuk performa optimal
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # 1. Reverse Proxy WebSocket Balapan
    location /ws/ {
        proxy_pass http://typingtest_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeout agar koneksi murid stabil selama sesi lomba
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 2. REST API Backend
    location /configuration {
        proxy_pass http://typingtest_backend/configuration;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /health {
        proxy_pass http://typingtest_backend/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 3. Static Assets Caching (CSS, JS, Fonts, Images)
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
        try_files $uri =404;
    }

    # 4. SPA Routing (untuk /race, /result908235, dll)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Aktifkan konfigurasi & reload NGINX:
```bash
sudo ln -s /etc/nginx/sites-available/typingtest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Langkah Tambahan: Pasang SSL Gratis (HTTPS / WSS) dengan Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com
```
Certbot akan otomatis mengonfigurasi sertifikat SSL gratis, memperbarui file NGINX ke port 443, dan mengalihkan semua koneksi HTTP/WS menjadi HTTPS/WSS yang aman.

---

## 5. Konfigurasi Khusus (Iklan, Database, dan File .env)

### A. Menghilangkan Iklan (Ad-Free by Default)
Monkeytype secara default memiliki fitur iklan (`ads: "result"`). Pada TypingTest Classroom Edition ini:
- Konfigurasi default di `frontend/src/ts/constants/default-config.ts` sudah diset ke:
  ```ts
  ads: "off"
  ```
- Ini memastikan seluruh murid dan pengajar tidak akan melihat slot iklan, banner donasi, atau pelacak eksternal di halaman manapun.

### B. Database (Zero-Dependency In-Memory Architecture)
- **Mode Lomba Kelas (`standalone-server.ts`)**:
  - Berjalan **100% in-memory**. Seluruh sesi perlombaan, WebSocket data, dan leaderboard murid diproses secara instan di RAM tanpa perlu menulis ke disk.
  - **Anda TIDAK PERLU menginstal MongoDB atau Redis di server Linux Anda.** Ini membuat konsumsi memori server sangat kecil (< 60MB RAM) dan setup zero-maintenance.
- **Apakah MongoDB & Redis dibutuhkan?**:
  - HANYA dibutuhkan jika Anda ingin menjalankan fitur Monkeytype penuh (sistem login akun email, riwayat statistik ketik permanen per akun selama berbulan-bulan). Untuk keperluan perlombaan kelas murid tanpa login, database eksternal sengaja tidak digunakan.

### C. Konfigurasi Environment (`.env`)

Untuk production, Anda cukup membuat file `backend/.env`:
```env
# Port server backend (default 5005)
PORT=5005

# Mode environment
NODE_ENV=production
```

Untuk frontend, jika frontend dan backend berada di bawah domain yang sama (dikelola oleh reverse proxy NGINX seperti pada panduan di atas), **tidak ada file `.env` yang diperlukan** karena proxy NGINX otomatis mengarahkan `/ws/` dan `/configuration` ke backend lokal port 5005.

---

## 6. Pengujian & Verifikasi Production

1. Buka browser: `https://domain-anda.com/result908235` (Layar Pengajar / Proyektor).
2. Di perangkat murid: `https://domain-anda.com/race?session=908235`.
3. Ketik nama murid lalu klik **Gabung Lomba**.
4. Klik **Mulai Lomba** di layar proyektor untuk memulai hitung mundur 3-2-1!
