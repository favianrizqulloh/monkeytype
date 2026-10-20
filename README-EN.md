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
    - `time`: 15s, 30s, 60s, 120s, or **180s (3-minute default)**.
    - `words`: 10, 25, 50, or 100 words.
    - `quote`: Random inspirational and educational passages.
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
     (or click "Mode Kompetisi" on the homepage)
     ```
   - Select the desired **Mode** (`time`, `words`, `quote`, or `custom`).
   - Configure word count / duration, toggle **punctuation** and **numbers** as needed.
   - Select **Language** (Bahasa Indonesia or English).
   - Enter a **Session ID** (or click **Randomize Code** for a random 6-digit code).
   - Click **Open Competition Room (Projector)**.
2. **Display on Projector / Smart TV**:
   - Project the tab onto the classroom display.
   - Click the **Fullscreen** button in the top right corner.
3. **Share Link / Session Code**:
   - Click **Copy Link** to share the URL or direct students to open `/race` and enter the session code.
4. **Start the Race**:
   - Monitor the joined students on the TypeRacer track.
   - Click **Start Race** once all students are present. A synchronized 3-2-1 countdown begins on all screens.
5. **After the Race**:
   - When time expires, typing is automatically locked. The podium awards 1st (Gold), 2nd (Silver), and 3rd (Bronze) based on Best WPM.
   - Click **Rematch** to start another round with fresh text.

---

### B. For Students
1. **Join the Competition**:
   - Navigate to `http://<teacher-ip>:3002/race` on your device (or click **Gabung Arena Lomba** on the homepage).
   - Enter your **Full Name** and the **Session ID** (6 digits) displayed on the teacher's projector screen (or automatically filled when using a direct link).
   - Click **Gabung Arena (Join Arena)**.
2. **Wait in Lobby & Countdown**:
   - Wait for the teacher to start the race.
   - When the countdown begins (3... 2... 1...), position your fingers on the *home row* keys (ASDF JKL;).
3. **Type & Repeat for Best Score**:
   - Type the passage as quickly and accurately as possible.
   - If you finish before time expires, press **Enter** to begin another round.
   - Your highest score among all rounds will be your final recorded score.
   - When time runs out, typing is automatically locked and your final ranking is displayed.

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
