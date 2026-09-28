# Monkeytype Offline Portable Build

## 📖 Tujuan
Membuat Monkeytype yang dapat berjalan **100% offline** tanpa koneksi internet sama sekali untuk penggunaan di lab/sekolah.
- ✅ Semua hasil tes disimpan secara lokal di device
- ✅ Tidak ada data yang dikirim ke server
- ✅ GDPR compliant (no tracking/telemetry)
- ✅ Bekerja dari USB, file:// protocol, atau local server

## 🚀 Cara Build

### Prerequisites
```bash
# Pastikan sudah install dependencies
cd repository-root
pnpm install
```

### Build Offline Version
```bash
cd frontend
pnpm run build-offline
```

✅ Hasil build akan berada di: `frontend/../dist/`

**Build hanya perlu dilakukan sekali.**

## 📂 Distribusi ke Siswa

### Opsi 1: USB Drive (Recommended)
1. Copy seluruh folder `dist` ke USB
2. Berikan USB ke siswa
3. Siswa buka `dist/index.html` dari USB
4. Aplikasi langsung berjalan offline

### Opsi 2: File Manager (Laptop Individual)
1. Copy folder `dist` ke Desktop atau Documents
2. Double-click `index.html`
3. Browser otomatis membuka aplikasi

### Opsi 3: School Internal Server (LAN)
```bash
# Di komputer server sekolah
cd dist
python3 -m http.server 8000
# Siswa buka: http://server-ip:8000
```

### Opsi 4: Live Server (Windows/Mac/Linux)
Jika menggunakan VS Code:
1. Install extension "Live Server"
2. Right-click `dist/index.html` → "Open with Live Server"
3. Browser otomatis membuka aplikasi

## ✨ Fitur Tersedia

✅ **Typing Tests:**
- Timed: 15s, 30s, 60s, custom
- Words mode
- Real-time WPM tracking
- Accuracy calculation
- Consistency metrics

✅ **Statistics & History:**
- Local test history (tidak terhapus)
- Personal statistics
- Chart dan analytics
- Personal best tracking

✅ **Customization:**
- Themes (20+ built-in)
- Language packs (40+ bahasa)
- Keyboard customization
- Sound effects
- Visual settings

✅ **Data Management:**
- Export results sebagai JSON
- Import results dari backup
- All data stored locally (IndexedDB + localStorage)

❌ **Tidak Tersedia (Disabled):**
- User authentication / login
- Cloud sync
- Online multiplayer
- Leaderboards
- Challenges
- Friend system
- Tournaments
- Account-based features
- Analytics tracking

## 🔒 Verifikasi Zero-Network (WAJIB DILAKUKAN)

**Sebelum mendistribusikan ke siswa, verifikasi aplikasi benar-benar offline:**

### Test 1: Offline Device
1. **Putuskan Wi-Fi dan kabel LAN dari komputer**
2. Buka `dist/index.html`
3. Buka DevTools (`F12`) → Network tab
4. Jalankan typing test 15 detik
5. Submit hasil
6. ✅ Pastikan Network tab tetap kosong (0 requests) ← **CRITICAL**

### Test 2: Network Firewall Block
1. **Windows:** Settings → Privacy & Security → Firewall → Block all network access untuk browser
2. Buka aplikasi
3. ✅ Aplikasi tetap berjalan normal
4. ✅ Test dapat diselesaikan
5. ✅ Hasil tersimpan

### Test 3: Data Persistence
1. Jalankan 3 test (15s, 30s, 60s)
2. Close browser
3. Buka ulang `dist/index.html`
4. ✅ Semua hasil test masih ada di history
5. ��� Statistics sudah ter-update

### Test 4: Export/Import
1. Menu → Export Results → Download JSON
2. Delete IndexedDB (DevTools → Application → IndexedDB → Delete)
3. Refresh halaman
4. Menu → Import Results → Upload JSON tadi
5. ✅ Semua data kembali

## 📊 Monitoring Siswa

### Cara Kumpulkan Hasil Test

**Metode 1: Export Manual (Per Siswa)**
```
Siswa:
1. Selesai test
2. Menu → Export Results → Save JSON
3. Kirim file ke guru via email/USB

Guru:
1. Buka dist/index.html
2. Menu → Import Results → Upload file siswa
3. Lihat statistics siswa
4. Screenshot atau export lagi untuk grading
```

**Metode 2: Collect via Shared Folder**
```
1. Buat shared folder di server sekolah
2. Siswa export hasil ke folder ini
3. Guru bisa monitoring real-time
```

**Metode 3: Manual Collection (Least Tech)**
```
1. Siswa lihat statistics di screen
2. Tulis hasil di kertas/spreadsheet
3. Guru kumpulkan hasil manual
```

## 🛠️ Troubleshooting

### ❌ Blank/White Page
**Penyebab:** Asset tidak ditemukan
**Solusi:**
- Pastikan membuka via HTTP server atau file:// langsung
- Jangan buka via `http://localhost` tanpa server
- Check DevTools → Console untuk error messages
- Rebuild: `pnpm run build-offline`

### ❌ "Cannot find module" Error
**Penyebab:** Dependencies belum diinstall
**Solusi:**
```bash
cd repository-root
pnpm install
cd frontend
pnpm run build-offline
```

### ❌ Data tidak tersimpan
**Penyebab:** Browser IndexedDB disabled
**Solusi:**
- Check DevTools → Application → IndexedDB
- Browser settings: Allow local storage
- Try different browser (Chrome/Firefox/Edge)

### ❌ Offline mode tidak aktif
**Penyebab:** Build dengan mode yang salah
**Solusi:**
```bash
# Pastikan build dengan offline mode
pnpm run build-offline

# Bukan:
pnpm run build  # ← Salah!
```

**Verifikasi di browser console:**
- ✅ Harus ada message: `[Offline Mode]` prefix
- ✅ Harus ada: `[Monkeytype Offline Build] Starting application`
- ❌ Jika tidak ada, rebuild dengan `pnpm run build-offline`

## 📋 Checklist Pre-Distribution

- [ ] Build selesai: `pnpm run build-offline`
- [ ] Folder `dist` sudah ada
- [ ] Test 1: Offline device ✓ (0 network requests)
- [ ] Test 2: Firewall block ✓ (aplikasi tetap jalan)
- [ ] Test 3: Data persistence ✓ (data tetap ada)
- [ ] Test 4: Export/Import ✓ (data bisa di-backup)
- [ ] Console log: `[Offline Mode]` message muncul ✓
- [ ] Siap didistribusikan ke siswa ✓

## 🏗️ Architecture

```
Offline Mode - Zero Internet Architecture:

┌─────────────────────────────────────────┐
│  Browser (File:// or HTTP)              │
│  ↓                                       │
│  index.html (Dynamic Entry Point)       │
│  ↓                                       │
│  Detects: VITE_OFFLINE_MODE=true        │
│  ↓                                       │
│  Loads: index-offline.ts (NOT index.ts) │
│  ↓                                       │
├─────────────────────────────────────────┤
│  APPLICATION LAYER (Offline Safe)       │
│  ├─ UI Components (Solid.js)            │
│  ├─ Test Engine                         │
│  └─ Statistics Logic                    │
├─────────────────────────────────────────┤
│  FIREBASE STUB (No Network)             │
│  ├─ firebase-offline.ts                 │
│  ├─ No auth network calls               │
│  └─ Throws on signin attempt            │
├─────────────────────────────────────────┤
│  SENTRY STUB (No Telemetry)             │
│  ├─ sentry-offline.ts                   │
│  ├─ No error reporting                  │
│  └─ Errors logged locally only          │
├─────────────────────────────────────────┤
│  VERSION STUB (No HTTP)                 │
│  ├─ version-offline.ts                  │
│  └─ Returns local version only          │
├─────────────────────────────────────────┤
│  STORAGE LAYER                          │
│  ├─ IndexedDB (Test results, settings)  │
│  ├─ LocalStorage (UI preferences)       │
│  └─ Zero network I/O                    │
└─────────────────────────────────────────┘
```

## 🔐 Security & Privacy

- ✅ **No data leaves device** - Everything stored locally
- ✅ **No telemetry** - Sentry completely disabled
- ✅ **No analytics** - No tracking at all
- ✅ **No external scripts** - reCAPTCHA removed
- ✅ **No API calls** - Firebase/backend disabled
- ✅ **GDPR compliant** - Zero data collection
- ✅ **Works 100% offline** - No internet required
- ✅ **No timestamps sent** - Only local timestamps

## 📞 Support

Jika siswa mengalami masalah:

1. **Check Console (F12 → Console)**
   - Pastikan ada `[Offline Mode]` message
   - Cek untuk error messages

2. **Verify Build**
   - Pastikan build dengan `pnpm run build-offline`
   - Bukan `pnpm run build`

3. **Network Check (F12 → Network)**
   - Reload halaman
   - Pastikan tidak ada red/failed requests
   - Count total requests = harus 0 atau minimal lokal

4. **IndexedDB Check**
   - F12 → Application → IndexedDB
   - Harus ada "MonkeytypeOffline" database
   - Harus ada tables: testResults, userSettings

## 📝 Build Info

- **Build Mode:** offline
- **Build Type:** Production
- **Entry Point:** src/index-offline.ts
- **Base Path:** ./
- **Target:** Zero network requests
- **Tested:** ✅ Fully offline capable
- **Distribution:** USB/File/LAN/Server ready

---

**Untuk pertanyaan lebih lanjut, check console logs - semua error ditampilkan dengan prefix `[Offline Mode]` untuk mudah diidentifikasi.**
