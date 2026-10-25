# TypingTest Live Competition (Multiplayer Classroom Edition)

**Bahasa / Language:** **[ Bahasa Indonesia ]** | [ English ](README-EN.md)

Aplikasi perlombaan mengetik cepat (*typing speed competition*) berbasis web yang menggabungkan estetika modern **Monkeytype** dan antarmuka balapan real-time **TypeRacer**. Dirancang khusus untuk kelas komputer sekolah, madrasah, dan pelatihan edukasi tanpa mewajibkan registrasi, email, atau SSO bagi murid.

---

## Fitur Utama

- **Pilihan Mode di Halaman Utama (`/`)**:
  - Saat membuka halaman utama, pengguna langsung disuguhkan 3 pilihan:
    - **Mode Latihan Mandiri (Solo WPM Test)**: Mengetik mandiri seperti Monkeytype standar.
    - **Gabung Arena Lomba**: Membuka halaman `/race` untuk bergabung ke arena kelas menggunakan Kode Sesi.
    - **Buka Sesi Lomba (Host / Guru)**: Membuka sesi baru di `/result` untuk diproyeksikan ke layar kelas.
  - Terdapat tombol pintas `🏆 Live Competition` pada bilah navigasi atas.
- **Formulir Gabung Arena yang Aman & Privat (`/race`)**:
  - Sesi lomba bersifat privat sehingga tidak ada celah bagi publik atau murid lain untuk masuk sembarangan.
  - Murid cukup memasukkan **Nama Lengkap Siswa** dan **Kode Sesi** (6 digit) yang ditampilkan di proyektor guru atau langsung membuka link yang dibagikan guru (kode sesi otomatis terisi).
- **Pengaturan Tingkat Mode & Kesulitan Lengkap (`/result`)**:
  - **Pilihan Mode**:
    - `time`: Durasi pengetikan fleksibel: 15s, 30s, 60s (1m), 120s (2m), **180s (3m default)**, **300s (5m)**, atau **600s (10m)**.
    - `words`: Jumlah target kata: 10, 25, 50, atau 100 kata.
    - `quote`: Kutipan inspiratif & edukatif autentik (Ki Hajar Dewantara, B.J. Habibie, Ir. Soekarno, Mohammad Hatta, Buya Hamka, Tan Malaka, R.A. Kartini, Albert Einstein, Nelson Mandela, dll.) yang panjangnya secara cerdas diskalakan mengikuti durasi pilihan guru (15s s/d 10m). Setiap putaran baru (*multi-attempt*) otomatis menyajikan kutipan segar yang berbeda tanpa pengulangan teks yang sama.
    - `custom`: Teks materi atau soal pengetikan bebas yang ditentukan oleh guru.
  - **Toggles Tambahan**:
    - `@ punctuation`: Menyertakan huruf kapital dan tanda baca (titik, koma).
    - `# numbers`: Menyertakan angka acak dalam teks.
  - **Pilihan Bahasa**:
    - `Bahasa Indonesia` (Default).
    - `English` (Bahasa Inggris).
- **Countdown & Timer Tersinkronisasi**:
  - Hitungan mundur nyata **3... 2... 1...** animasi serentak di layar murid dan proyektor.
  - Sinkronisasi timer real-time per detik dari server WebSocket (`timer_sync`).
  - **Anti-Cheat Timer Lock**: Begitu batas waktu habis, input pengetikan seluruh murid otomatis terkunci total (`disabled`) dan skor langsung difinalisasi.
- **Kompetisi Multi-Attempt & Skor WPM Terbaik (Best Score)**:
  - Siswa yang menyelesaikan teks sebelum batas waktu berakhir dapat menekan **Enter** untuk mengulang pengetikan demi mengejar WPM lebih tinggi.
  - Papan skor dan podium juara mengurutkan peserta berdasarkan **skor WPM tertinggi (Best WPM)** dari seluruh putaran yang dilakukan.
- **Tombol Salin Link Fleksibel**:
  - Bekerja secara otomatis di semua format domain maupun IP lokal LAN (`http://192.168.x.x:3002`, `http://localhost:3002`, maupun `https://domainku.com`).
- **Ringan & Bebas Ketergantungan Database**:
  - Backend *in-memory* mandiri tanpa ketergantungan MongoDB atau Redis.
- **Node.js 24 LTS Ready**:
  - Dioptimalkan dan teruji penuh pada Node.js versi 24 LTS.

---

## Panduan Penggunaan di Kelas Komputer

### A. Untuk Admin Guru / Pengawas Lomba
1. **Buka Panel Pengaturan Lomba**:
   - Buka browser di komputer guru dan akses halaman:
     ```text
     http://localhost:3002/result
     (atau klik tombol "Buka Sesi Lomba (Host / Guru)" di halaman utama)
     ```
   - Tentukan **Mode & Durasi**: Pilihan durasi fleksibel mulai dari **15s, 30s, 60s (1m), 120s (2m), 180s (3m default), 300s (5m), hingga 600s (10m)**, atau gunakan mode kata/kutipan/teks kustom materi pelajaran.
   - Atur **Tingkat Kesulitan & Bahasa**: Aktifkan **punctuation** (huruf kapital & tanda baca) dan **numbers** (angka acak) bila diinginkan, serta pilih **Bahasa Indonesia** atau **English**.
   - Tentukan **Kode Sesi** (atau klik tombol **Acak Kode** untuk 6 digit acak).
   - Klik **Buka Ruang Lomba (Proyektor)**.
2. **Tampilkan ke Layar Proyektor / Smart TV**:
   - Proyeksikan tab browser tersebut ke layar proyektor kelas.
   - Klik ikon **Layar Penuh (Fullscreen)** di pojok kanan atas agar tampilan proyektor maksimal.
3. **Bagikan Link / Kode ke Siswa**:
   - Klik tombol **Salin Link** untuk menyalin link sesi murid (fleksibel di LAN maupun domain online), atau arahkan siswa membuka `/race` di browser komputer masing-masing dengan memasukkan Kode Sesi 6-digit.
4. **Mulai & Pantau Perlombaan**:
   - Perhatikan daftar siswa yang terhubung di lintasan balapan TypeRacer secara real-time.
   - Setelah seluruh siswa bergabung, klik tombol **Mulai Lomba**. Hitungan mundur 3-2-1 dan timer sesi akan berjalan serentak di layar proyektor dan seluruh komputer siswa.
5. **Setelah Selesai & Ronde Ulang (Rematch)**:
   - Begitu batas waktu habis, pengetikan siswa otomatis terkunci total (*anti-cheat lock*). Podium juara menampilkan Juara 1 (Emas), Juara 2 (Perak), dan Juara 3 (Perunggu) berdasarkan **WPM Terbaik (Best Score)**.
   - Guru dapat menekan **Ulangi Lomba (Rematch)** untuk ronde balapan berikutnya dengan teks acak baru tanpa perlu membuat sesi ulang.

---

### B. Untuk Siswa / Murid
1. **Bergabung ke Lomba**:
   - Buka browser di komputer Anda dan akses:
     ```text
     http://<ip-komputer-guru>:3002/race
     (atau klik tombol "Gabung Arena Lomba" di halaman utama)
     ```
   - Masukkan **Nama Lengkap Siswa** dan **Kode Sesi** (6 digit) yang tertera di layar proyektor guru (jika membuka tautan yang dibagikan guru, kode sesi otomatis terisi).
   - Klik **Gabung Arena**.
2. **Menunggu di Lobi & Hitungan Mundur**:
   - Tunggu di lobi hingga guru menekan tombol mulai lomba.
   - Saat hitungan mundur animasi **3... 2... 1...** muncul di layar, letakkan jari pada posisi *home row* keyboard (ASDF JKL;).
3. **Mengetik & Mengulang Putaran demi Skor Terbaik (Best Score)**:
   - Ketik teks pada layar secepat dan seakurat mungkin. Huruf yang salah ketik akan ditandai warna merah.
   - Durasi berjalan serentak sesuai pilihan guru (15 detik s/d 10 menit).
   - **Fitur Multi-Attempt**: Jika Anda menyelesaikan teks sebelum waktu habis, segera tekan tombol **Enter** untuk langsung mengetik putaran berikutnya!
   - Skor yang masuk ke papan juara dan podium adalah **skor WPM tertinggi (Best Score)** dari seluruh putaran yang Anda selesaikan.
   - Ketika waktu habis, pengetikan otomatis terkunci dan peringkat akhir Anda langsung ditampilkan.

---

## Arsitektur & Port

| Komponen | Port / Protokol | Deskripsi |
|---|---|---|
| **Frontend Web** | `3002 (HTTP)` | SolidJS (`.tsx`) + TailwindCSS UI (Internal Server) |
| **Backend Race Server** | `5005 (HTTP/WS)` | WebSocket `ws://.../ws/race` + Mock REST API (`0.0.0.0`) |
| **NGINX Reverse Proxy (HTTP)** | `80 (TCP)` | Redirect otomatis (301 Permanent) ke HTTPS |
| **NGINX Gateway (HTTPS)** | `443 (TCP / UDP)` | **Wajib HTTPS**: Mendukung **HTTP/2** (TCP) & **HTTP/3 QUIC** (UDP) + WSS |

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
- Halaman Utama: [http://localhost:3002](http://localhost:3002)
- Layar Pengaturan Guru / Proyektor: [http://localhost:3002/result](http://localhost:3002/result)
- Layar Murid: [http://localhost:3002/race](http://localhost:3002/race)

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

Frontend aktif di `http://localhost:3002` (atau IP lokal Anda `http://<ip-komputer>:3002`).

---

## 3. Panduan Production & Deployment di Linux Server (ARM64 / x86_64)

Arsitektur aplikasi ini 100% kompatibel dengan prosesor **Linux ARM64 / aarch64** (seperti AWS Graviton, Oracle Cloud Ampere A1, Raspberry Pi 4/5, server Ampere Altra) serta server **x86_64**.

### Langkah 1: Persiapan Server Linux (Node.js 24 LTS)

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Instal dependensi dasar, Nginx, Certbot (SSL), dan Git
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx

# Instal Node.js 24 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi versi Node.js
node -v           # Pastikan v24.x.x
npm -v

# Aktifkan pnpm & instal PM2
sudo corepack enable
sudo npm install -g pnpm pm2

# Buka port firewall (Wajib buka TCP 80, TCP 443, dan UDP 443 untuk HTTP/3 QUIC)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
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

---

## 4. Konfigurasi Reverse Proxy NGINX (Wajib HTTPS, HTTP/2, & HTTP/3 QUIC)

Pada mode produksi, NGINX diatur sebagai **Reverse Proxy Gateway Aman** dengan enkripsi SSL/TLS, pengalihan otomatis HTTP ke HTTPS, serta akselerasi **HTTP/2** (TCP) dan **HTTP/3** (QUIC via UDP).

### Langkah 4A: Dapatkan Sertifikat SSL Gratis (Let's Encrypt)
Pastikan domain Anda (misal `typing.sekolahku.sch.id`) sudah mengarah ke IP publik server, lalu jalankan:

```bash
sudo certbot certonly --nginx -d domain-anda.com
```

### Langkah 4B: Pasang File Konfigurasi NGINX
Buat file `/etc/nginx/sites-available/typingtest`:

```nginx
# Upstream ke internal backend & frontend service
upstream typingtest_frontend {
    server 127.0.0.1:3002;
    keepalive 32;
}

upstream typingtest_backend {
    server 127.0.0.1:5005;
    keepalive 32;
}

# 1. HTTP Server - Pengalihan Otomatis (301) ke HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name domain-anda.com;

    # Alihkan seluruh trafik HTTP tanpa enkripsi langsung ke HTTPS
    return 301 https://$host$request_uri;
}

# 2. HTTPS Server - HTTP/2 & HTTP/3 (QUIC)
server {
    # Port 443 TCP: HTTPS & HTTP/2
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    # Port 443 UDP: HTTP/3 berbasis QUIC
    listen 443 quic reuseport;
    listen [::]:443 quic reuseport;
    http3 on;
    quic_retry on;

    server_name domain-anda.com;

    # Path Sertifikat SSL/TLS
    ssl_certificate /etc/letsencrypt/live/domain-anda.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain-anda.com/privkey.pem;

    # Protokol & Pengaturan Keamanan TLS Modern
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # Header Iklan HTTP/3 untuk Browser (Chrome, Edge, Firefox, Safari)
    add_header Alt-Svc 'h3=":443"; ma=86400' always;

    # Header Keamanan Standar
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;

    # Kompresi Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Lokasi 1: WebSocket Balapan Realtime (WSS)
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

    # Lokasi 2: REST API & Status Backend
    location ~ ^/(configuration|health) {
        proxy_pass http://typingtest_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Lokasi 3: Frontend Web Application (SolidJS)
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

> **Catatan Kompatibilitas NGINX**:
> - Direktif `http2 on;` digunakan pada NGINX versi $\ge 1.25.1$. Pada NGINX versi lama ($< 1.25.1$), gunakan sintaks `listen 443 ssl http2;`.
> - Fitur HTTP/3 (QUIC) berjalan di atas protokol **UDP port 443**. Pastikan firewall VPS/cloud provider (AWS Security Group, GCP Firewall, Oracle Cloud Security List) telah membuka port **443 UDP**.
> - Enkripsi HTTPS wajib digunakan di lingkungan produksi agar fitur Clipboard API (`Salin Link`) dan WebSocket aman (`wss://`) dapat bekerja penuh di semua browser.

### Langkah 4C: Aktifkan Konfigurasi & Muat Ulang NGINX
```bash
sudo ln -s /etc/nginx/sites-available/typingtest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
