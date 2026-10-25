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

| Component | Port | Description |
|---|---|---|
| **Frontend Web** | `3002` | SolidJS (`.tsx`) + TailwindCSS UI (Dev or Production Preview) |
| **Backend Race Server** | `5005` | WebSocket `ws://.../ws/race` + Mock REST API (`0.0.0.0`) |
| **NGINX Reverse Proxy** | `80` / `443` | Reverse proxy gateway (On the same server or a dedicated server) |

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
