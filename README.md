# TypingTest Multiplayer (Classroom Edition)

**Bahasa / Language:** **[ Bahasa Indonesia ]** | [ English ](README-EN.md)

Aplikasi perlombaan mengetik cepat (typing speed competition) berbasis web yang mengadopsi tampilan modern **Monkeytype** dan antarmuka balapan real-time **TypeRacer**. Dirancang khusus untuk kelas komputer sekolah/edukasi tanpa mewajibkan registrasi, email, atau SSO bagi murid.

---

## Fitur Utama

- **Layar Murid (`/race`)**: Cukup masukkan Nama Lengkap & ID Sesi (misal `908235`). Tanpa login/email/SSO.
- **Layar Guru / Proyektor (`/result<sessionId>`)**: Tampilan layar lebar untuk proyektor dengan countdown bersama 3-2-1, live race tracks animasi mobil/roket, podium juara 1, 2, 3 (Emas, Perak, Perunggu), dan efek konfeti selebrasi.
- **Bahasa & Mode Lomba**: Menggunakan teks kutipan inspiratif & edukatif Bahasa Indonesia dengan batas waktu 60 detik.
- **Real-time Synchronization**: Menggunakan WebSocket ultra-low latency untuk update progres dan WPM.
- **Ringan & Cepat**: Backend standalone mandiri tanpa ketergantungan database eksternal (MongoDB/Redis) untuk mode kelas lomba.
- **Node.js 24 Ready**: Dioptimalkan dan teruji penuh pada Node.js versi 24 LTS.

---

## Arsitektur & Port

| Komponen | Port | Deskripsi |
|---|---|---|
| **Frontend Web** | `3002` | SolidJS (`.tsx`) + TailwindCSS UI (Dev atau Production Preview) |
| **Backend Race Server** | `5005` | WebSocket `ws://.../ws/race` + Mock REST API (`0.0.0.0`) |
| **NGINX Reverse Proxy** | `80` / `443` | Reverse proxy gateway (Bisa di server sama atau server berbeda) |

---

## 1. Menjalankan di Mode Development (Lokal)

### Prasyarat
- **Node.js** v24.x LTS (disarankan v24.0.0 atau lebih baru)
- **pnpm** v11.x atau v12.x

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
- Layar Guru / Proyektor: [http://localhost:3002/result908235](http://localhost:3002/result908235)
- Layar Murid: [http://localhost:3002/race?session=908235](http://localhost:3002/race?session=908235)

---

## 2. Pengujian Production Secara Lokal (Tanpa Butuh NGINX)

Anda dapat menguji build production langsung di komputer/laptop lokal sebelum memasang reverse proxy:

```bash
# 1. Build semua packages & frontend
pnpm --filter="./packages/*" run build
cd frontend && pnpm run build && cd ..

# 2. Jalankan Backend Race Server (Terminal 1)
pnpm run race-server

# 3. Jalankan Frontend Production Server (Terminal 2)
pnpm run preview-frontend
```

Frontend aktif di `http://localhost:3002` (atau IP lokal Anda `http://<ip-komputer>:3002`). Anda bisa langsung mengetes performa production dan koneksi WebSocket balapan tanpa perlu menginstal NGINX terlebih dahulu.

---

## 3. Panduan Production & Deployment di Linux Server (ARM64 / x86_64)

Arsitektur aplikasi ini 100% kompatibel dengan prosesor **Linux ARM64 / aarch64** (seperti AWS Graviton, Oracle Cloud Ampere A1, Raspberry Pi 4/5, server Ampere Altra) serta server **x86_64**.

### Langkah 1: Persiapan Server Linux (Node.js 24 LTS)

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Instal dependensi dasar, Nginx, dan Git
sudo apt install -y curl git build-essential nginx

# Instal Node.js 24 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi versi Node.js
node -v           # Pastikan v24.x.x
npm -v

# Aktifkan pnpm & instal PM2
sudo corepack enable
sudo npm install -g pnpm pm2
```

### Langkah 2: Clone & Build Proyek

```bash
# Siapkan direktori web
sudo mkdir -p /var/www/typingtest
sudo chown -R $USER:$USER /var/www/typingtest

cd /var/www/typingtest
git clone <URL_REPOSITORY_ANDA> .

# Instal dependensi seluruh monorepo
pnpm install --frozen-lockfile

# Build internal packages & frontend
pnpm --filter="./packages/*" run build
cd frontend && pnpm run build && cd ..
```

### Langkah 3: Menjalankan Service Production dengan PM2

Jalankan kedua service (Backend dan Frontend) di latar belakang menggunakan PM2:

```bash
cd /var/www/typingtest

# 1. Jalankan Backend Race WebSocket Server (Port 5005)
pm2 start "node backend/node_modules/tsx/dist/cli.mjs backend/src/race/standalone-server.ts" --name "typingtest-race"

# 2. Jalankan Frontend Web Server (Port 3002)
pm2 start "pnpm --filter @monkeytype/frontend run start" --name "typingtest-frontend"

# Simpan proses agar otomatis aktif setelah reboot server
pm2 save
pm2 startup
```

Perintah pemantauan:
```bash
pm2 status
pm2 logs
```

---

## 4. Konfigurasi Reverse Proxy NGINX (Pure Reverse Proxy)

Pada model ini, NGINX **tidak membaca file statis secara langsung**, melainkan murni bertindak sebagai **Reverse Proxy Gateway**. Keuntungan:
- Frontend tetap aktif di port `3002` dan dapat diakses lokal.
- NGINX dapat dipasang di server yang sama **atau di perangkat server yang terpisah** (misal: NGINX sebagai load balancer/edge server di Server A, aplikasi berjalan di Server B).

### Langkah Buat Konfigurasi NGINX

```bash
sudo nano /etc/nginx/sites-available/typingtest
```

Tempel konfigurasi berikut:

```nginx
# -------------------------------------------------------------
# Definisi Upstream Aplikasi
# - Jika NGINX berada di server yang SAMA: gunakan 127.0.0.1
# - Jika NGINX berada di server BERBEDA: ganti dengan IP server aplikasi
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
    server_name domain-anda.com; # Ganti dengan domain atau IP publik server Anda

    # Kompresi Gzip untuk transmisi cepat
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # 1. Reverse Proxy WebSocket Balapan (/ws/)
    location /ws/ {
        proxy_pass http://typingtest_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout panjang agar koneksi WebSocket siswa tidak putus
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
Certbot akan otomatis memperbarui konfigurasi NGINX ke port 443 dan mengalihkan semua koneksi HTTP/WS menjadi HTTPS/WSS.

---

## 5. Konfigurasi Khusus (Iklan, Database, dan File .env)

### A. Menghilangkan Iklan (Ad-Free by Default)
- Konfigurasi default di `frontend/src/ts/constants/default-config.ts` sudah disetel permanen ke:
  ```ts
  ads: "off"
  ```
- Seluruh murid dan pengajar tidak akan melihat slot iklan, banner, atau pelacak eksternal di halaman manapun.

### B. Database (Zero-Dependency In-Memory Architecture)
- **Mode Lomba Kelas (`standalone-server.ts`)**:
  - Berjalan **100% in-memory**. Seluruh sesi perlombaan, WebSocket data, dan leaderboard murid diproses secara instan di RAM.
  - **Anda TIDAK PERLU menginstal MongoDB atau Redis.** Konsumsi memori server sangat kecil (< 60MB RAM) dan setup zero-maintenance.

### C. File Environment (`.env`)
Untuk backend:
```env
# backend/.env
PORT=5005
NODE_ENV=production
```
Untuk frontend:
Tidak memerlukan `.env` tambahan karena NGINX otomatis me-reverse proxy `/ws/` dan `/configuration` ke backend.

---

## 6. Pengujian & Verifikasi

1. **Akses Langsung (Lokal/Internal)**:
   - Proyektor Guru: `http://localhost:3002/result908235`
   - Layar Siswa: `http://localhost:3002/race?session=908235`
2. **Akses Publik (via NGINX)**:
   - Proyektor Guru: `https://domain-anda.com/result908235`
   - Layar Siswa: `https://domain-anda.com/race?session=908235`
3. Klik **Gabung Lomba** di tab siswa, lalu klik **Mulai Lomba** di layar proyektor. Hitung mundur 3-2-1 dan arena pengetikan akan tersinkronisasi secara real-time!
