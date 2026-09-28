# Monkeytype Offline Portable Build

## Tujuan
Membuat Monkeytype yang dapat berjalan **100% offline** tanpa koneksi internet sama sekali.
Semua hasil tes disimpan secara lokal di device.

## Cara Build

```bash
# Dari root repository
cd frontend

# Build offline version
pnpm run build-offline
```

Hasil build akan berada di: `frontend/../dist/`

## Cara Menggunakan

### Opsi 1: Buka Langsung (File Manager)
1. Buka folder `dist`
2. Double-click `index.html`
3. Browser akan membuka aplikasi secara offline

### Opsi 2: Copy ke USB/Portable
1. Copy seluruh folder `dist` ke USB
2. Buka `dist/index.html` dari USB di komputer mana pun (tanpa internet)

### Opsi 3: Jalankan Simple HTTP Server (Linux/Mac)
```bash
cd dist
python3 -m http.server 8000
# Buka http://localhost:8000
```

### Opsi 4: Live Server di VS Code (Recommended)
1. Install extension "Live Server"
2. Right-click `dist/index.html` → "Open with Live Server"
3. Browser otomatis membuka aplikasi

## Fitur Offline

✅ **Tersedia:**
- Typing tests (15s, 30s, 60s, custom)
- WPM, Accuracy, Consistency tracking
- Local statistics dan history
- Settings (theme, language, keybinds, dll)
- Themes dan language packs
- Sound effects
- Export/Import results sebagai JSON

❌ **Tidak Tersedia (Disabled):**
- User authentication (login/signup)
- Cloud sync
- Online multiplayer
- Leaderboards
- Challenges
- Friend features
- Account recovery
- Analytics

## Verifikasi Zero-Network

Untuk memastikan aplikasi **TIDAK** membuat request internet:

1. **Offline Komputer:** Disconnect dari WiFi/LAN sebelum buka
2. **Check DevTools:**
   - Buka `F12` → Network tab
   - Refresh halaman
   - Tidak boleh ada request/red entries
3. **Test Typing:**
   - Buka aplikasi
   - Jalankan typing test lengkap
   - Submit hasil
   - Network tab masih harus kosong (0 requests)
4. **Restart Browser:**
   - Close dan buka ulang browser
   - Data hasil test harus masih ada di history

## Troubleshooting

### Error: "Cannot find module"
- Pastikan sudah run `pnpm install` di root directory
- Run `pnpm run build-offline` dari folder `frontend`

### Assets tidak load (blank page)
- Pastikan membuka via HTTPS server atau `file://` langsung
- JANGAN buka via `http://localhost` tanpa server (relative paths)
- Gunakan Live Server atau Python HTTP server

### Data tidak tersimpan
- Browser harus support IndexedDB (semua modern browser support)
- Check browser settings - jangan matikan local storage/IndexedDB
- Try different browser jika masalah persistent

### Offline Mode Tidak Aktif
- Check browser console (F12 → Console)
- Harus ada message: `[Offline Mode] Firebase stub module loaded`
- Jika tidak ada, build ulang dengan `pnpm run build-offline`

## Architecture

```
Offline Mode Layers:
┌─────────────────────────────────┐
│  UI Components (React/Solid.js) │
├─────────────────────────────────┤
│  Offline Storage (IndexedDB)    │
├─────────────────────────────────┤
│  Network Guard (offline.ts)     │
├─────────────────────────────────┤
│  Firebase Stub (firebase-offline.ts)   │
│  Sentry Stub (sentry-offline.ts)       │
│  Version Check Stub (version-offline.ts) │
└─────────────────────────────────┘
```

## Network Guards (Prevent External Calls)

Semua network calls di-guard dengan `IS_OFFLINE_BUILD` flag:

```typescript
if (IS_OFFLINE_BUILD) {
  // Skip network call
  return null;
}
// Normal online operation
```

## Technical Details

### Build Configuration
- **Entry:** `frontend/src/index-offline.ts`
- **Config:** `frontend/vite.config.offline.ts`
- **Env:** `frontend/.env.offline`
- **Base Path:** `./` (relative for file:// protocol)

### Modules Stubbed (No Network)
- Firebase Authentication
- Sentry Error Reporting
- Version Check
- Analytics
- Telemetry
- PWA Service Workers

### Storage
- **IndexedDB:** Test results, user settings
- **LocalStorage:** UI preferences, cookies
- **No Cloud:** Everything stays on device

## For Lab/School Use

1. **Preparation:**
   ```bash
   pnpm run build-offline
   ```

2. **Distribution:**
   - Copy `dist` folder to USB drive or shared folder
   - Or host on school's internal server

3. **Student Usage:**
   - Click `index.html` dari USB/server
   - Start typing test immediately
   - No login required
   - Results saved locally

4. **Export Results:**
   - Menu → Export Results → JSON
   - Teacher dapat kumpulkan file JSON untuk grading
   - Atau buka di aplikasi untuk lihat statistics

## Security Notes

- ✅ No data leaves the device
- ✅ No telemetry collection
- ✅ No tracking
- ✅ No analytics
- ✅ No external scripts
- ✅ No API calls
- ✅ Works 100% offline
- ✅ GDPR compliant (no data collection)

## Support

Jika ada masalah:
1. Check browser console (F12 → Console) untuk error messages
2. Pastikan offline mode aktif: `[Offline Mode]` prefix di console
3. Cek `.env.offline` settings
4. Build ulang dengan `pnpm run build-offline`

---

**Build Date:** $(date)
**Version:** OFFLINE-BUILD
**Mode:** Production Offline
