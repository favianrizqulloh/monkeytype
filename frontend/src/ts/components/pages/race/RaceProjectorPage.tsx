import {
  createMemo,
  createSignal,
  For,
  JSXElement,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import {
  copyToClipboard,
  disconnectRaceSocket,
  joinRoom,
  resetRace,
  startRace,
} from "../../../services/race-socket";
import {
  getRaceStatus,
  getRemainingSeconds,
  getSessionDuration,
  getSessionId,
  leaderboard,
  participants,
  resetRaceState,
  setSessionDuration,
  setSessionId,
} from "../../../states/race";
import { Button } from "../../common/Button";
import { Fa } from "../../common/Fa";

function generateRandomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function RaceProjectorPage(): JSXElement {
  const [isFullscreen, setIsFullscreen] = createSignal(false);
  const [copiedLink, setCopiedLink] = createSignal(false);
  const [hasActiveSession, setHasActiveSession] = createSignal(false);

  // Setup form signals
  const [setupSessionId, setSetupSessionId] =
    createSignal(generateRandomCode());
  const [setupDuration, setSetupDuration] = createSignal<number>(180);

  onMount(() => {
    let session = "";
    const path = window.location.pathname;

    const slashMatch = /\/result\/([^/?#]+)/.exec(path);
    const directMatch = /\/result([^/?#]+)/.exec(path);

    const firstSlash = slashMatch?.[1];
    const firstDirect = directMatch?.[1];

    if (firstSlash !== undefined && firstSlash.length > 0) {
      session = firstSlash;
    } else if (firstDirect !== undefined && firstDirect.length > 0) {
      session = firstDirect;
    }

    if (session.length > 0) {
      setSetupSessionId(session);
      setSessionId(session);
      setSessionDuration(setupDuration());
      setHasActiveSession(true);
      joinRoom(session, "Pengajar (Proyektor)", true, setupDuration());
    }

    const onFullscreenChange = (): void => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    onCleanup(() => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      disconnectRaceSocket();
      resetRaceState();
    });
  });

  const handleStartSession = (e?: Event): void => {
    e?.preventDefault();
    const session = setupSessionId().trim();
    if (session.length === 0) return;

    window.history.pushState(null, "", `/result/${session}`);
    setSessionId(session);
    setSessionDuration(setupDuration());
    setHasActiveSession(true);
    joinRoom(session, "Pengajar (Proyektor)", true, setupDuration());
  };

  const handleRandomizeCode = (): void => {
    setSetupSessionId(generateRandomCode());
  };

  const toggleFullscreen = async (): Promise<void> => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const copyJoinLink = async (): Promise<void> => {
    const url = `${window.location.origin}/race?session=${getSessionId()}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const studentParticipants = createMemo(() =>
    participants.filter((p) => !p.isTeacher),
  );

  const top1 = createMemo(() => leaderboard[0]);
  const top2 = createMemo(() => leaderboard[1]);
  const top3 = createMemo(() => leaderboard[2]);
  const restRanks = createMemo(() => leaderboard.slice(3));

  return (
    <div class="flex min-h-screen w-full flex-col bg-bg p-6 text-text select-none">
      {/* View 1: Teacher Session Setup Form (if /result has no session yet) */}
      <Show when={!hasActiveSession()}>
        <div class="mx-auto flex w-full max-w-xl flex-col items-center justify-center py-10">
          <div class="flex w-full flex-col gap-6 rounded-double border border-sub/20 bg-sub-alt/30 p-8 shadow-2xl backdrop-blur-md">
            <div class="flex flex-col items-center text-center">
              <div class="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-main/15 text-main shadow-[0_0_24px_var(--main-color)]">
                <Fa icon="fa-tv" size={2} />
              </div>
              <h1 class="text-3xl font-black tracking-tight text-text">
                TypingTest Live Competition
              </h1>
              <p class="mt-1 text-sm text-sub">
                Panel Pengajar / Guru — Pengaturan Sesi Lomba Baru
              </p>
            </div>

            <form onSubmit={handleStartSession} class="flex flex-col gap-5">
              {/* Kode Sesi Input & Acak Button */}
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold tracking-wider text-sub uppercase">
                  Kode / ID Sesi Lomba
                </label>
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    class="rounded-radius flex-1 border border-sub/30 bg-bg px-4 py-3 font-mono text-xl font-bold tracking-widest text-main transition-all outline-none focus:border-main focus:ring-2 focus:ring-main/20"
                    value={setupSessionId()}
                    onInput={(e) => setSetupSessionId(e.currentTarget.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="text"
                    class="rounded-radius flex items-center gap-2 border border-sub/30 bg-sub-alt/50 px-4 py-3 text-sm font-semibold text-text hover:bg-sub/20 active:scale-95"
                    onClick={handleRandomizeCode}
                  >
                    <Fa icon="fa-random" />
                    <span>Acak Kode</span>
                  </Button>
                </div>
                <span class="text-[11px] text-sub">
                  Siswa akan memasukkan kode ini saat bergabung di komputer
                  masing-masing.
                </span>
              </div>

              {/* Durasi Sesi Lomba Selector */}
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold tracking-wider text-sub uppercase">
                  Durasi Sesi Kompetisi
                </label>
                <div class="grid grid-cols-4 gap-2">
                  <For
                    each={[
                      { label: "1 Menit", sec: 60 },
                      { label: "2 Menit", sec: 120 },
                      { label: "3 Menit (Default)", sec: 180 },
                      { label: "5 Menit", sec: 300 },
                    ]}
                  >
                    {(item) => (
                      <button
                        type="button"
                        class={`rounded-radius flex flex-col items-center justify-center p-3 text-center transition-all ${
                          setupDuration() === item.sec
                            ? "border-2 border-main bg-main/15 font-bold text-main shadow-md"
                            : "border border-sub/20 bg-bg text-sub hover:border-sub/50 hover:text-text"
                        }`}
                        onClick={() => setSetupDuration(item.sec)}
                      >
                        <span class="text-xs">{item.label}</span>
                        <span class="font-mono text-[10px] opacity-70">
                          {item.sec} detik
                        </span>
                      </button>
                    )}
                  </For>
                </div>
                <span class="text-[11px] text-sub">
                  Siswa dapat mengulang mengetik bila selesai lebih awal. Skor
                  tertinggi (Best WPM) mereka yang akan dicatat!
                </span>
              </div>

              {/* Panduan Guru Card */}
              <div class="rounded-radius flex flex-col gap-2 border border-sub/20 bg-bg/80 p-4 text-xs text-sub">
                <div class="flex items-center gap-2 font-bold text-text">
                  <Fa icon="fa-chalkboard-teacher" class="text-main" />
                  <span>Petunjuk Penggunaan untuk Guru / Pengawas:</span>
                </div>
                <ol class="list-inside list-decimal space-y-1.5 pl-1 text-sub">
                  <li>
                    Atur Kode Sesi dan Durasi (default direkomendasikan 3
                    menit).
                  </li>
                  <li>
                    Klik <b>&quot;Buka Ruang Lomba&quot;</b> untuk membuka layar
                    proyektor.
                  </li>
                  <li>
                    Tampilkan layar tersebut ke Proyektor / Smart TV kelas.
                  </li>
                  <li>
                    Bagikan Link atau Kode Sesi kepada siswa untuk diakses via
                    browser masing-masing.
                  </li>
                </ol>
              </div>

              <Button
                type="submit"
                variant="text"
                class="rounded-radius mt-2 flex w-full items-center justify-center gap-2 bg-main py-4 text-base font-bold text-bg shadow-[0_4px_16px_var(--main-color)] transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <Fa icon="fa-tv" />
                <span>Buka Ruang Lomba (Proyektor)</span>
              </Button>
            </form>
          </div>
        </div>
      </Show>

      {/* View 2: Live Competition Projector View */}
      <Show when={hasActiveSession()}>
        {/* Top Control Bar */}
        <header class="rounded-radius flex flex-wrap items-center justify-between gap-4 border border-sub/20 bg-sub-alt/30 px-6 py-4 backdrop-blur-md">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-main/20 text-main shadow-[0_0_20px_var(--main-color)]">
              <Fa icon="fa-tv" size={1.5} />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl font-black tracking-tight text-text">
                  TypingTest Live Competition
                </h1>
                <span class="rounded-full bg-main/20 px-2.5 py-0.5 text-xs font-bold text-main">
                  LIVE
                </span>
              </div>
              <p class="text-xs text-sub">
                Lomba Mengetik Cepat Kelas Komputer (Durasi{" "}
                {getSessionDuration()} Detik — Skor WPM Tertinggi)
              </p>
            </div>
          </div>

          {/* Center: Session ID badge & Copy link */}
          <div class="flex items-center gap-3">
            <div class="rounded-radius flex items-center gap-2 border border-sub/30 bg-bg px-4 py-2">
              <span class="text-xs text-sub">KODE SESI:</span>
              <span class="font-mono text-xl font-black text-main">
                {getSessionId()}
              </span>
            </div>

            <Button
              variant="text"
              class="rounded-radius flex items-center gap-2 border border-sub/30 bg-sub-alt/50 px-3 py-2 text-xs font-semibold text-text transition-all hover:bg-sub/20"
              onClick={copyJoinLink}
            >
              <Fa icon={copiedLink() ? "fa-check" : "fa-copy"} />
              <span>{copiedLink() ? "Link Tersalin!" : "Salin Link"}</span>
            </Button>
          </div>

          {/* Right Action Controls */}
          <div class="flex items-center gap-3">
            <Show when={getRaceStatus() === "lobby"}>
              <Button
                variant="text"
                class="rounded-radius flex items-center gap-2 bg-main px-6 py-2.5 font-bold text-bg shadow-[0_4px_16px_var(--main-color)] transition-all hover:brightness-110 active:scale-95"
                onClick={() => startRace(getSessionDuration())}
              >
                <Fa icon="fa-play" />
                <span>Mulai Lomba</span>
              </Button>
            </Show>

            <Show when={getRaceStatus() === "racing"}>
              <div class="rounded-radius flex items-center gap-2 border border-main bg-main/10 px-4 py-2 text-main">
                <Fa icon="fa-stopwatch" class="animate-pulse" />
                <span class="font-mono text-lg font-black">
                  {getRemainingSeconds()}s
                </span>
              </div>
            </Show>

            <Show when={getRaceStatus() === "finished"}>
              <Button
                variant="text"
                class="rounded-radius flex items-center gap-2 bg-main px-6 py-2.5 font-bold text-bg shadow-[0_4px_16px_var(--main-color)] transition-all hover:brightness-110 active:scale-95"
                onClick={() => resetRace(undefined, getSessionDuration())}
              >
                <Fa icon="fa-redo-alt" />
                <span>Ulangi Lomba (Rematch)</span>
              </Button>
            </Show>

            <Button
              variant="text"
              class="rounded-radius flex items-center justify-center border border-sub/20 bg-sub-alt/40 p-2.5 text-text hover:bg-sub/20"
              onClick={toggleFullscreen}
              balloon={{
                text: isFullscreen()
                  ? "Keluar Layar Penuh"
                  : "Layar Penuh Proyektor",
                position: "down",
              }}
            >
              <Fa icon={isFullscreen() ? "fa-compress" : "fa-expand"} />
            </Button>
          </div>
        </header>

        {/* Main Body */}
        <main class="mt-6 flex flex-1 flex-col gap-6">
          {/* Banner Instruksi Masuk Siswa (Tampil di Mode Lobi) */}
          <Show when={getRaceStatus() === "lobby"}>
            <div class="flex flex-wrap items-center justify-between gap-6 rounded-double border border-main/30 bg-main/5 p-6 shadow-lg">
              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold tracking-widest text-main uppercase">
                  Petunjuk Siswa
                </span>
                <h2 class="text-2xl font-black text-text">
                  Buka Web di Komputer Masing-Masing & Masukkan Kode Sesi
                </h2>
                <p class="text-sm text-sub">
                  URL Siswa:{" "}
                  <span class="font-mono font-bold text-text">
                    {window.location.origin}/race
                  </span>{" "}
                  | Kode:{" "}
                  <span class="font-mono text-lg font-black text-main">
                    {getSessionId()}
                  </span>
                </p>
                <span class="text-xs text-sub">
                  💡 Tips: Siswa dapat mengulang mengetik berkali-kali selama 3
                  menit. Skor terbaik (Best WPM) otomatis masuk ke peringkat!
                </span>
              </div>

              <div class="flex items-center gap-4">
                <div class="flex flex-col items-end">
                  <span class="text-xs text-sub">Total Siswa Terhubung</span>
                  <span class="font-mono text-3xl font-black text-main">
                    {studentParticipants().length}
                  </span>
                </div>
              </div>
            </div>
          </Show>

          {/* Live Race Tracks (TypeRacer Style) */}
          <div class="flex flex-col gap-3 rounded-double border border-sub/20 bg-sub-alt/20 p-6">
            <div class="flex items-center justify-between border-b border-sub/20 pb-3">
              <div class="flex items-center gap-2">
                <Fa icon="fa-road" class="text-main" />
                <h2 class="text-lg font-bold text-text">
                  Lintasan Balapan Murid (TypeRacer Style)
                </h2>
              </div>
              <span class="text-xs text-sub">
                {studentParticipants().length} Siswa Terdaftar
              </span>
            </div>

            <div class="flex flex-col gap-3 pt-2">
              <Show
                when={studentParticipants().length > 0}
                fallback={
                  <div class="flex h-36 flex-col items-center justify-center gap-2 text-sub">
                    <Fa icon="fa-users" size={2} class="opacity-40" />
                    <p class="text-sm">
                      Menunggu murid bergabung ke dalam sesi...
                    </p>
                  </div>
                }
              >
                <For each={studentParticipants()}>
                  {(participant) => (
                    <div class="rounded-radius flex items-center gap-4 border border-sub/10 bg-bg/80 p-3 shadow-xs transition-all">
                      {/* Participant Name & Status */}
                      <div class="flex w-48 items-center gap-2.5 truncate">
                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sub/20 text-xs font-bold text-text">
                          <Show
                            when={participant.rank !== undefined}
                            fallback={<Fa icon="fa-user" />}
                          >
                            {(r) => <span>#{r()}</span>}
                          </Show>
                        </div>
                        <div class="flex flex-col truncate">
                          <span class="truncate text-sm font-bold text-text">
                            {participant.name}
                          </span>
                          <span class="text-[10px] text-sub">
                            {(participant.attemptsCount ?? 0) > 1
                              ? `Putaran ke-${participant.attemptsCount}`
                              : participant.finished
                                ? "Selesai"
                                : "Sedang mengetik"}
                          </span>
                        </div>
                      </div>

                      {/* Race Lane with Moving Racer Avatar */}
                      <div class="relative flex h-8 flex-1 items-center overflow-hidden rounded-full border border-sub/15 bg-sub-alt/60 px-2">
                        {/* Checkered Finish Line */}
                        <div class="absolute top-0 right-0 bottom-0 w-3 bg-[repeating-linear-gradient(45deg,#000,#000_4px,#fff_4px,#fff_8px)] opacity-50"></div>

                        {/* Racer Progress Marker */}
                        <div
                          class="absolute flex items-center transition-all duration-300 ease-out"
                          style={{
                            left: `calc(${participant.progress}% - ${participant.progress > 90 ? "32px" : "0px"})`,
                          }}
                        >
                          <div class="flex items-center gap-1 rounded-full bg-main px-2.5 py-0.5 text-xs font-black text-bg shadow-[0_0_10px_var(--main-color)]">
                            <Fa icon="fa-car-side" />
                            <span>{participant.progress}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Live Speed & Best WPM Badge */}
                      <div class="flex w-28 shrink-0 flex-col items-end">
                        <span class="font-mono text-sm font-black text-main">
                          {(participant.bestWpm ?? 0) > 0
                            ? `${participant.bestWpm} WPM`
                            : `${participant.wpm} WPM`}
                        </span>
                        <span class="text-[10px] text-sub">
                          {(participant.bestWpm ?? 0) > 0
                            ? "Best Score"
                            : `${participant.accuracy}% Tepat`}
                        </span>
                      </div>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          </div>

          {/* Dynamic Leaderboard & Podium Section (Ranked by Best WPM) */}
          <Show when={leaderboard.length > 0}>
            <div class="flex flex-col gap-6 rounded-double border border-main/30 bg-sub-alt/30 p-8 shadow-2xl backdrop-blur-md">
              <div class="flex items-center justify-between border-b border-sub/20 pb-4">
                <div class="flex items-center gap-3">
                  <Fa icon="fa-trophy" size={1.5} class="text-main" />
                  <h2 class="text-2xl font-black text-text">
                    Papan Skor & Podium Juara (Best WPM)
                  </h2>
                </div>
                <span class="rounded-full bg-main/20 px-3 py-1 text-xs font-bold text-main">
                  SKOR TERTINGGI
                </span>
              </div>

              {/* Top 1-3 Podium Cards */}
              <div class="grid grid-cols-1 items-end gap-6 pt-4 md:grid-cols-3">
                {/* Juara 2 (Perak) */}
                <div class="border-slate-400/40 order-2 flex flex-col items-center rounded-double border bg-bg/90 p-6 shadow-md transition-all hover:scale-102 md:order-1">
                  <div class="bg-slate-300/20 text-slate-300 mb-2 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_0_16px_rgba(203,213,225,0.4)]">
                    <Fa icon="fa-medal" size={1.75} />
                  </div>
                  <span class="text-slate-400 font-mono text-xs font-bold tracking-wider uppercase">
                    Juara 2 (Perak)
                  </span>
                  <h3 class="mt-1 text-xl font-black text-text">
                    {top2()?.name ?? "—"}
                  </h3>
                  <div class="mt-3 flex items-baseline gap-1">
                    <span class="text-slate-300 font-mono text-3xl font-extrabold">
                      {top2()?.bestWpm ?? top2()?.wpm ?? 0}
                    </span>
                    <span class="text-xs text-sub">WPM</span>
                  </div>
                  <span class="mt-1 text-xs text-sub">
                    Akurasi: {top2()?.bestAccuracy ?? top2()?.accuracy ?? 0}% |{" "}
                    {top2()?.attemptsCount ?? 1} Putaran
                  </span>
                </div>

                {/* Juara 1 (Emas - Highest Podium) */}
                <div class="border-yellow-500 order-1 flex -translate-y-3 flex-col items-center rounded-double border-2 bg-bg p-8 shadow-[0_0_40px_rgba(234,179,8,0.25)] transition-all hover:scale-105 md:order-2">
                  <div class="bg-yellow-500/20 text-yellow-400 mb-2 flex h-18 w-18 animate-bounce items-center justify-center rounded-full shadow-[0_0_24px_rgba(234,179,8,0.6)]">
                    <Fa icon="fa-crown" size={2.25} />
                  </div>
                  <span class="text-yellow-400 font-mono text-sm font-black tracking-widest uppercase">
                    JUARA 1 (EMAS)
                  </span>
                  <h3 class="mt-1 text-2xl font-black text-text">
                    {top1()?.name ?? "—"}
                  </h3>
                  <div class="mt-3 flex items-baseline gap-1">
                    <span class="text-yellow-400 font-mono text-5xl font-black">
                      {top1()?.bestWpm ?? top1()?.wpm ?? 0}
                    </span>
                    <span class="text-sm font-bold text-sub">WPM</span>
                  </div>
                  <span class="mt-1 text-sm font-medium text-text">
                    Akurasi: {top1()?.bestAccuracy ?? top1()?.accuracy ?? 0}% |{" "}
                    {top1()?.attemptsCount ?? 1} Putaran
                  </span>
                </div>

                {/* Juara 3 (Perunggu) */}
                <div class="border-amber-700/40 order-3 flex flex-col items-center rounded-double border bg-bg/90 p-6 shadow-md transition-all hover:scale-102">
                  <div class="bg-amber-700/20 text-amber-500 mb-2 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_0_16px_rgba(180,83,9,0.4)]">
                    <Fa icon="fa-award" size={1.75} />
                  </div>
                  <span class="text-amber-600 font-mono text-xs font-bold tracking-wider uppercase">
                    Juara 3 (Perunggu)
                  </span>
                  <h3 class="mt-1 text-xl font-black text-text">
                    {top3()?.name ?? "—"}
                  </h3>
                  <div class="mt-3 flex items-baseline gap-1">
                    <span class="text-amber-500 font-mono text-3xl font-extrabold">
                      {top3()?.bestWpm ?? top3()?.wpm ?? 0}
                    </span>
                    <span class="text-xs text-sub">WPM</span>
                  </div>
                  <span class="mt-1 text-xs text-sub">
                    Akurasi: {top3()?.bestAccuracy ?? top3()?.accuracy ?? 0}% |{" "}
                    {top3()?.attemptsCount ?? 1} Putaran
                  </span>
                </div>
              </div>

              {/* Ranking 4 ke Bawah */}
              <Show when={restRanks().length > 0}>
                <div class="mt-4 flex flex-col gap-2">
                  <span class="text-xs font-bold tracking-wider text-sub uppercase">
                    Peringkat 4 dan Seterusnya
                  </span>
                  <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <For each={restRanks()}>
                      {(item) => (
                        <div class="rounded-radius flex items-center justify-between border border-sub/15 bg-bg px-4 py-2.5">
                          <div class="flex items-center gap-3">
                            <span class="flex h-7 w-7 items-center justify-center rounded-md bg-sub/20 font-mono text-xs font-bold text-sub">
                              #{item.rank}
                            </span>
                            <span class="text-sm font-semibold text-text">
                              {item.name}
                            </span>
                          </div>
                          <div class="flex items-center gap-4">
                            <span class="font-mono text-sm font-bold text-main">
                              {item.bestWpm ?? item.wpm} WPM
                            </span>
                            <span class="text-xs text-sub">
                              {item.bestAccuracy ?? item.accuracy}%
                            </span>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </div>
          </Show>

          {/* Footer Guide for Teacher */}
          <div class="rounded-radius flex flex-col gap-2 border border-sub/20 bg-sub-alt/20 p-4 text-xs text-sub">
            <div class="flex items-center gap-2 font-bold text-text">
              <Fa icon="fa-info-circle" class="text-main" />
              <span>Instruksi Admin Guru / Pengawas:</span>
            </div>
            <p>
              1. Klik tombol <b>&quot;Salin Link&quot;</b> untuk menyalin URL
              lomba siswa, lalu bagikan ke grup kelas atau arahkan siswa
              mengetik <b class="text-text">{window.location.origin}/race</b>{" "}
              dengan Kode Sesi <b class="text-main">{getSessionId()}</b>.
            </p>
            <p>
              2. Setelah seluruh nama siswa muncul di lintasan TypeRacer, tekan{" "}
              <b>&quot;Mulai Lomba&quot;</b> untuk hitungan mundur 3 detik
              serentak.
            </p>
            <p>
              3. Siswa dapat mengetik berulang kali selama 3 menit. Papan skor
              dan podium juara akan otomatis mengurutkan siswa berdasarkan skor{" "}
              <b>WPM tertinggi (Best Score)</b> mereka.
            </p>
          </div>
        </main>
      </Show>
    </div>
  );
}
