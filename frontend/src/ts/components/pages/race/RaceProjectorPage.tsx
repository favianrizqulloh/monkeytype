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
  disconnectRaceSocket,
  joinRoom,
  resetRace,
  startRace,
} from "../../../services/race-socket";
import {
  getRaceStatus,
  getRemainingSeconds,
  getSessionId,
  leaderboard,
  participants,
  resetRaceState,
  setSessionId,
} from "../../../states/race";
import { Button } from "../../common/Button";
import { Fa } from "../../common/Fa";

export function RaceProjectorPage(): JSXElement {
  const [isFullscreen, setIsFullscreen] = createSignal(false);
  const [copiedLink, setCopiedLink] = createSignal(false);

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

    if (session.length === 0) {
      session = "908235";
    }

    setSessionId(session);
    joinRoom(session, "Pengajar (Proyektor)", true);

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

  const toggleFullscreen = async (): Promise<void> => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const copyJoinLink = (): void => {
    const url = `${window.location.origin}/race?session=${getSessionId()}`;
    void navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
      {/* Top Projector Control Bar */}
      <header class="rounded-radius flex flex-wrap items-center justify-between gap-4 border border-sub/20 bg-sub-alt/30 px-6 py-4 backdrop-blur-md">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-main/20 text-main shadow-[0_0_20px_var(--main-color)]">
            <Fa icon="fa-tv" size={1.5} />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-black tracking-tight text-text">
                TypingTest Proyektor
              </h1>
              <span class="rounded-full bg-main/20 px-2.5 py-0.5 text-xs font-bold text-main">
                LIVE
              </span>
            </div>
            <p class="text-xs text-sub">
              Lomba Mengetik Cepat Kelas Komputer (Batas Waktu 60 Detik)
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
            <span>{copiedLink() ? "Tersalin!" : "Salin Link"}</span>
          </Button>
        </div>

        {/* Right Action Controls */}
        <div class="flex items-center gap-3">
          <Show when={getRaceStatus() === "lobby"}>
            <Button
              variant="text"
              class="rounded-radius flex items-center gap-2 bg-main px-6 py-2.5 font-bold text-bg shadow-[0_4px_16px_var(--main-color)] transition-all hover:brightness-110 active:scale-95"
              onClick={startRace}
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
              onClick={() => resetRace()}
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
        {/* Banner Instruksi Masuk Murid (Tampil di Mode Lobi) */}
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
                    <div class="flex w-44 items-center gap-2.5 truncate">
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
                          {participant.finished
                            ? "Selesai"
                            : `${participant.wpm} WPM`}
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

                    {/* Live Speed & Accuracy Badge */}
                    <div class="flex w-24 shrink-0 flex-col items-end">
                      <span class="font-mono text-sm font-black text-main">
                        {participant.wpm} WPM
                      </span>
                      <span class="text-[10px] text-sub">
                        {participant.accuracy}% Tepat
                      </span>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </div>

        {/* Dynamic Leaderboard & Podium Section */}
        <Show when={leaderboard.length > 0}>
          <div class="flex flex-col gap-6 rounded-double border border-main/30 bg-sub-alt/30 p-8 shadow-2xl backdrop-blur-md">
            <div class="flex items-center justify-between border-b border-sub/20 pb-4">
              <div class="flex items-center gap-3">
                <Fa icon="fa-trophy" size={1.5} class="text-main" />
                <h2 class="text-2xl font-black text-text">
                  Papan Skor & Podium Juara
                </h2>
              </div>
              <span class="rounded-full bg-main/20 px-3 py-1 text-xs font-bold text-main">
                TOP RANKINGS
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
                    {top2()?.wpm ?? 0}
                  </span>
                  <span class="text-xs text-sub">WPM</span>
                </div>
                <span class="mt-1 text-xs text-sub">
                  Akurasi: {top2()?.accuracy ?? 0}%
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
                    {top1()?.wpm ?? 0}
                  </span>
                  <span class="text-sm font-bold text-sub">WPM</span>
                </div>
                <span class="mt-1 text-sm font-medium text-text">
                  Akurasi: {top1()?.accuracy ?? 0}% | Waktu:{" "}
                  {top1()?.durationSeconds ?? 0}s
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
                    {top3()?.wpm ?? 0}
                  </span>
                  <span class="text-xs text-sub">WPM</span>
                </div>
                <span class="mt-1 text-xs text-sub">
                  Akurasi: {top3()?.accuracy ?? 0}%
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
                            {item.wpm} WPM
                          </span>
                          <span class="text-xs text-sub">{item.accuracy}%</span>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </Show>
      </main>
    </div>
  );
}
