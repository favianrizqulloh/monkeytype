# TypingTest Live Competition (Multiplayer Classroom Edition)

**Bahasa / Language:** **[ Bahasa Indonesia ]** | [ English ](README-EN.md)

Aplikasi perlombaan mengetik cepat (*typing speed competition*) berbasis web yang menggabungkan estetika modern **Monkeytype** dan antarmuka balapan real-time **TypeRacer**. Dirancang khusus untuk kelas komputer sekolah, madrasah, dan pelatihan edukasi tanpa mewajibkan registrasi, email, atau SSO bagi murid.

---

## Fitur Utama

- **Pilihan Mode di Halaman Utama (`/`)**:
  - Saat membuka halaman utama, pengguna langsung disuguhkan pilihan:
    - **Mode Latihan Mandiri (Solo WPM Test)**: Mengetik sendiri seperti Monkeytype standar.
    - **Mode Kompetisi / Multiplayer (Buka Sesi Lomba)**: Langsung diarahkan ke `/result` untuk membuka ruang lomba proyektor.
  - Terdapat tombol pintas `🏆 Live Competition` pada bilah navigasi atas.
- **Pengaturan Tingkat Mode & Kesulitan Lengkap (`/result`)**:
  - **Pilihan Mode**:
    - `time`: Durasi 15s, 30s, 60s, 120s, atau **180s (3 menit default)**.
    - `words`: Jumlah kata 10, 25, 50, atau 100 kata.
    - `quote`: Kutipan inspiratif & edukatif acak.
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
     (atau klik tombol "Mode Kompetisi" di halaman utama)
     ```
   - Pilih **Mode** (`time`, `words`, `quote`, atau `custom`).
   - Tentukan nilai durasi atau jumlah kata, aktifkan **punctuation** / **numbers** bila diinginkan.
   - Pilih **Bahasa** (Bahasa Indonesia atau English).
   - Tentukan **Kode Sesi** (atau klik tombol **Acak Kode** untuk 6 digit acak).
   - Klik **Buka Ruang Lomba (Proyektor)**.
2. **Tampilkan ke Layar Proyektor / Smart TV**:
   - Proyeksikan tab browser tersebut ke layar proyektor kelas.
   - Klik ikon **Layar Penuh (Fullscreen)** di pojok kanan atas agar tampilan proyektor maksimal.
3. **Bagikan Link / Kode ke Siswa**:
   - Klik tombol **Salin Link** untuk menyalin link sesi murid, atau arahkan siswa untuk membuka `/race` di browser komputer masing-masing dengan memasukkan Kode Sesi yang tertera di proyektor.
4. **Mulai Perlombaan**:
   - Perhatikan daftar siswa yang terhubung di lintasan balapan TypeRacer.
   - Setelah seluruh siswa bergabung, klik tombol **Mulai Lomba**. Hitungan mundur 3-2-1 akan berjalan serentak di layar proyektor dan semua komputer siswa.
5. **Setelah Selesai**:
   - Begitu waktu habis, pengetikan siswa otomatis terkunci. Podium juara menampilkan Juara 1 (Emas), Juara 2 (Perak), dan Juara 3 (Perunggu) berdasarkan WPM Terbaik.
   - Guru dapat menekan **Ulangi Lomba (Rematch)** untuk ronde balapan berikutnya dengan teks acak baru.

---

### B. Untuk Siswa / Murid
1. **Bergabung ke Lomba**:
   - Buka browser di komputer Anda dan akses:
     ```text
     http://<ip-komputer-guru>:3002/race
     (atau link yang dibagikan guru)
     ```
   - Masukkan **Nama Lengkap** Anda dan **Kode Sesi** yang ditampilkan di layar proyektor guru.
   - Klik **Gabung Lomba**.
2. **Menunggu di Lobi & Hitungan Mundur**:
   - Tunggu hingga guru menekan tombol mulai lomba.
   - Saat hitungan mundur 3... 2... 1... muncul, bersiaplah di tombol *home row* keyboard (ASDF JKL;).
3. **Mengetik & Mengulang Putaran (Best Score)**:
   - Ketik teks pada layar secepat dan seakurat mungkin.
   - Jika Anda selesai mengetik sebelum waktu habis, tekan tombol **Enter** untuk langsung mengetik putaran berikutnya!
   - Skor yang akan masuk ke papan juara adalah **skor WPM tertinggi (Best Score)** Anda.
   - Ketika waktu habis, pengetikan akan otomatis terkunci dan peringkat akhir Anda akan ditampilkan.

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

---

## 4. Konfigurasi Reverse Proxy NGINX (Pure Reverse Proxy)

Pada model ini, NGINX **tidak membaca file statis secara langsung**, melainkan murni bertindak sebagai **Reverse Proxy Gateway**:

```nginx
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
    server_name domain-anda.com;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    location /ws/ {
        proxy_pass http://typingtest_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location ~ ^/(configuration|health) {
        proxy_pass http://typingtest_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

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
