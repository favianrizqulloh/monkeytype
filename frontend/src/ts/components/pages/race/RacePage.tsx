import {
  createEffect,
  createMemo,
  createSignal,
  For,
  JSXElement,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import { navigate } from "../../../controllers/route-controller";
import {
  ActiveSessionSummary,
  disconnectRaceSocket,
  fetchActiveSessions,
  joinRoom,
} from "../../../services/race-socket";
import {
  getCountdownSeconds,
  getMyName,
  getMyParticipantId,
  getRaceStatus,
  getSessionId,
  leaderboard,
  participants,
  resetRaceState,
  setMyName,
  setSessionId,
} from "../../../states/race";
import { cn } from "../../../utils/cn";
import { Button } from "../../common/Button";
import { Fa } from "../../common/Fa";
import { RaceTypingArena } from "./RaceTypingArena";

export function RacePage(): JSXElement {
  let nameInputRef: HTMLInputElement | undefined;

  const [inputName, setInputName] = createSignal("");
  const [inputSession, setInputSession] = createSignal("");
  const [hasJoined, setHasJoined] = createSignal(false);
  const [activeSessions, setActiveSessions] = createSignal<
    ActiveSessionSummary[]
  >([]);
  const [isLoadingSessions, setIsLoadingSessions] = createSignal(false);
  const [finalResult, setFinalResult] = createSignal<{
    wpm: number;
    accuracy: number;
    timeSec: number;
  } | null>(null);

  const loadSessions = async (): Promise<void> => {
    setIsLoadingSessions(true);
    try {
      const list = await fetchActiveSessions();
      setActiveSessions(list);
    } catch {
      setActiveSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  onMount(() => {
    void loadSessions();

    // Check if session ID was provided via pathname or query param
    const pathParts = window.location.pathname
      .split("/")
      .filter((part) => part.length > 0);
    const queryParams = new URLSearchParams(window.location.search);
    const querySession = queryParams.get("session") ?? queryParams.get("id");

    const firstPart = pathParts[0];
    const secondPart = pathParts[1];
    if (
      pathParts.length >= 2 &&
      firstPart === "race" &&
      secondPart !== undefined &&
      secondPart.length > 0
    ) {
      setInputSession(secondPart);
    } else if (querySession !== null && querySession.length > 0) {
      setInputSession(querySession);
    }

    if (nameInputRef) {
      nameInputRef.focus();
    }
  });

  onCleanup(() => {
    disconnectRaceSocket();
    resetRaceState();
  });

  createEffect(() => {
    if (getRaceStatus() === "lobby") {
      setFinalResult(null);
    }
  });

  const handleJoin = (e?: Event): void => {
    e?.preventDefault();
    const name = inputName().trim();
    const session = inputSession().trim();

    if (name.length === 0 || session.length === 0) return;

    setMyName(name);
    setSessionId(session);
    setHasJoined(true);
    joinRoom(session, name, false);
  };

  const myParticipant = createMemo(() =>
    participants.find(
      (p) => p.id === getMyParticipantId() || p.name === getMyName(),
    ),
  );

  const myRank = createMemo(() => {
    const name = getMyName();
    const entry = leaderboard.find((p) => p.name === name);
    return entry?.rank ?? myParticipant()?.rank;
  });

  return (
    <div class="mx-auto flex w-full max-w-4xl flex-col items-center justify-center py-8">
      {/* State 1: Active Sessions Browser & Join Form */}
      <Show when={!hasJoined()}>
        <div class="flex w-full flex-col gap-6">
          <div class="flex flex-col items-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-main/10 text-main shadow-[0_0_20px_var(--main-color)]">
              <Fa icon="fa-flag-checkered" size={1.75} />
            </div>
            <h1 class="text-3xl font-black tracking-tight text-text">
              TypingTest Arena
            </h1>
            <p class="mt-1 text-sm text-sub">
              Kompetisi Mengetik Cepat Kelas Komputer & Multiplayer
            </p>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left: Active Sessions Browser */}
            <div class="flex flex-col gap-4 rounded-double border border-sub/20 bg-sub-alt/30 p-6 shadow-xl backdrop-blur-md">
              <div class="flex items-center justify-between border-b border-sub/20 pb-3">
                <div class="flex items-center gap-2">
                  <Fa icon="fa-list-ul" class="text-main" />
                  <span class="font-bold text-text">Sesi Lomba Terbuka</span>
                  <span class="rounded-full bg-main/20 px-2 py-0.5 text-xs font-bold text-main">
                    {activeSessions().length}
                  </span>
                </div>
                <button
                  type="button"
                  title="Segarkan daftar sesi"
                  class="rounded-radius flex items-center gap-1.5 px-2.5 py-1 text-xs text-sub transition-all hover:bg-sub/20 hover:text-text"
                  onClick={() => void loadSessions()}
                  disabled={isLoadingSessions()}
                >
                  <Fa
                    icon="fa-sync-alt"
                    class={isLoadingSessions() ? "animate-spin text-main" : ""}
                  />
                  <span>Segarkan</span>
                </button>
              </div>

              <div class="flex max-h-80 flex-col gap-2.5 overflow-y-auto pr-1">
                <Show
                  when={activeSessions().length > 0}
                  fallback={
                    <div class="flex flex-col items-center justify-center gap-2 py-10 text-center text-sub">
                      <Fa icon="fa-inbox" size={2} class="opacity-40" />
                      <p class="text-xs">
                        Belum ada sesi lomba yang aktif saat ini.
                      </p>
                      <p class="text-[11px] text-sub/70">
                        Guru dapat membuat sesi di halaman proyektor, atau Anda
                        dapat memasukkan kode manual di samping.
                      </p>
                    </div>
                  }
                >
                  <For each={activeSessions()}>
                    {(session) => {
                      const isSelected = () =>
                        inputSession().trim() === session.sessionId;
                      return (
                        <div
                          class={cn(
                            "rounded-radius flex cursor-pointer flex-col gap-1.5 border p-3 transition-all",
                            isSelected()
                              ? "border-main bg-main/15 shadow-[0_0_12px_var(--main-color)]"
                              : "border-sub/20 bg-bg/60 hover:border-main/50 hover:bg-sub-alt/40",
                          )}
                          onClick={() => {
                            setInputSession(session.sessionId);
                            if (!inputName() && nameInputRef) {
                              nameInputRef.focus();
                            }
                          }}
                        >
                          <div class="flex items-center justify-between">
                            <span class="font-mono text-base font-black tracking-wide text-text">
                              #{session.sessionId}
                            </span>
                            <span
                              class={cn(
                                "rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase",
                                session.status === "lobby"
                                  ? "bg-main/20 text-main"
                                  : session.status === "racing"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-sub/20 text-sub",
                              )}
                            >
                              {session.status === "lobby"
                                ? "Menunggu Peserta"
                                : session.status === "racing"
                                  ? "Sedang Lomba"
                                  : "Selesai"}
                            </span>
                          </div>

                          <div class="flex flex-wrap items-center gap-2 text-xs text-sub">
                            <span class="flex items-center gap-1">
                              <Fa icon="fa-clock" class="text-[10px]" />
                              {session.durationSeconds}s
                            </span>
                            <span>•</span>
                            <span class="flex items-center gap-1">
                              <Fa icon="fa-sliders-h" class="text-[10px]" />
                              {session.mode ?? "time"}
                            </span>
                            <span>•</span>
                            <span class="flex items-center gap-1">
                              <Fa icon="fa-users" class="text-[10px]" />
                              {session.participantCount} peserta
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </Show>
              </div>

              <div class="mt-auto border-t border-sub/10 pt-3">
                <button
                  type="button"
                  class="rounded-radius flex w-full items-center justify-center gap-2 border border-main/40 bg-main/10 py-2.5 text-xs font-bold text-main transition-all hover:bg-main hover:text-bg"
                  onClick={() => void navigate("/result")}
                >
                  <Fa icon="fa-trophy" />
                  <span>Buka Sesi Baru (Host / Guru)</span>
                </button>
              </div>
            </div>

            {/* Right: Join Form */}
            <div class="flex flex-col gap-5 rounded-double border border-sub/20 bg-sub-alt/30 p-6 shadow-xl backdrop-blur-md">
              <div class="border-b border-sub/20 pb-3">
                <span class="font-bold text-text">Formulir Gabung Lomba</span>
                <p class="text-xs text-sub">
                  Pilih sesi dari daftar atau ketik kode lomba langsung.
                </p>
              </div>

              <form onSubmit={handleJoin} class="flex flex-col gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold tracking-wider text-sub uppercase">
                    Nama Lengkap Siswa
                  </label>
                  <input
                    ref={(el) => (nameInputRef = el)}
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    class="rounded-radius w-full border border-sub/30 bg-bg px-4 py-3 text-base text-text transition-all outline-none placeholder:text-sub/50 focus:border-main focus:ring-2 focus:ring-main/20"
                    value={inputName()}
                    onInput={(e) => setInputName(e.currentTarget.value)}
                    required
                  />
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold tracking-wider text-sub uppercase">
                    Kode / ID Sesi Lomba
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 908235"
                    class="rounded-radius w-full border border-sub/30 bg-bg px-4 py-3 font-mono text-base font-semibold tracking-widest text-text uppercase transition-all outline-none placeholder:text-sub/50 focus:border-main focus:ring-2 focus:ring-main/20"
                    value={inputSession()}
                    onInput={(e) => setInputSession(e.currentTarget.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="text"
                  class="rounded-radius mt-2 flex w-full items-center justify-center gap-2 bg-main py-3.5 font-bold text-bg shadow-[0_4px_16px_var(--main-color)] transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  <Fa icon="fa-sign-in-alt" />
                  <span>Masuk Arena Lomba</span>
                </Button>
              </form>

              {/* Card Petunjuk Siswa */}
              <div class="rounded-radius flex flex-col gap-2 border border-sub/20 bg-sub-alt/40 p-3.5 text-xs text-sub">
                <div class="flex items-center gap-2 font-bold text-text">
                  <Fa icon="fa-info-circle" class="text-main" />
                  <span>Petunjuk Lomba:</span>
                </div>
                <ul class="list-inside list-disc space-y-1 pl-1 text-sub">
                  <li>Lomba berlangsung serentak sesuai durasi sesi.</li>
                  <li>
                    Selesai paragraf duluan? Tekan <b>Enter</b> untuk ronde
                    berikutnya.
                  </li>
                  <li>
                    Papan juara menghitung{" "}
                    <b class="text-main">WPM Tertinggi (Best Score)</b> Anda!
                  </li>
                </ul>
              </div>

              <p class="text-center text-[11px] text-sub/70">
                Murni untuk kelas belajar komputer. Tanpa login email atau SSO.
              </p>
            </div>
          </div>
        </div>
      </Show>

      {/* State 2 to 5: Connected to Session */}
      <Show when={hasJoined()}>
        {/* Top Header Information */}
        <div class="rounded-radius mb-6 flex w-full items-center justify-between border border-sub/20 bg-sub-alt/30 px-6 py-3">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-main/20 text-main">
              <Fa icon="fa-user-graduate" />
            </div>
            <div>
              <span class="text-xs text-sub">Peserta:</span>
              <p class="font-bold text-text">{getMyName()}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-sub">Sesi:</span>
            <span class="rounded-sm bg-sub/20 px-2.5 py-1 font-mono text-sm font-bold text-main">
              #{getSessionId()}
            </span>
          </div>
        </div>

        {/* State 2: Lobby (Waiting for teacher) */}
        <Show when={getRaceStatus() === "lobby"}>
          <div class="flex w-full flex-col items-center gap-6 rounded-double border border-sub/20 bg-sub-alt/20 p-10 text-center">
            <div class="relative flex h-20 w-20 items-center justify-center rounded-full bg-main/10 text-main">
              <Fa
                icon="fa-hourglass-half"
                size={2}
                class="animate-spin text-main"
              />
              <div class="absolute inset-0 animate-ping rounded-full border border-main/30"></div>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text">
                Menunggu Pengajar Memulai Lomba...
              </h2>
              <p class="mt-2 text-sm text-sub">
                Pastikan posisi duduk dan jarimu siap di atas keyboard. Balapan
                akan dimulai serentak!
              </p>
            </div>

            {/* List of Joined Classmates */}
            <div class="mt-4 flex w-full flex-col gap-3">
              <span class="text-xs font-semibold tracking-wider text-sub uppercase">
                Teman Sekelas yang Terhubung (
                {participants.filter((p) => !p.isTeacher).length})
              </span>
              <div class="flex flex-wrap justify-center gap-2">
                <For each={participants.filter((p) => !p.isTeacher)}>
                  {(p) => (
                    <div
                      class={cn(
                        "flex items-center gap-2 rounded-full border border-sub/20 bg-bg px-4 py-1.5 text-sm",
                        {
                          "border-main bg-main/10 font-bold text-main":
                            p.name === getMyName(),
                          "text-text": p.name !== getMyName(),
                        },
                      )}
                    >
                      <Fa icon="fa-user" class="text-xs opacity-60" />
                      <span>{p.name}</span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </Show>

        {/* State 3: Countdown (3... 2... 1...) */}
        <Show when={getRaceStatus() === "countdown"}>
          <div class="flex h-72 w-full animate-pulse flex-col items-center justify-center gap-4 rounded-double border border-main/30 bg-main/5 p-8 text-center">
            <span class="text-sm font-semibold tracking-widest text-sub uppercase">
              Bersiap-siap...
            </span>
            <div class="flex h-32 w-32 animate-bounce items-center justify-center rounded-full bg-main/20 font-mono text-7xl font-black text-main shadow-[0_0_40px_var(--main-color)]">
              {getCountdownSeconds()}
            </div>
            <p class="text-sm font-medium text-text">
              Letakkan jari pada posisi home row (ASDF JKL;)
            </p>
          </div>
        </Show>

        {/* State 4: Racing Arena */}
        <Show when={getRaceStatus() === "racing"}>
          <RaceTypingArena
            onComplete={(wpm, accuracy, timeSec) => {
              setFinalResult({ wpm, accuracy, timeSec });
            }}
          />
        </Show>

        {/* State 5: Finished Screen */}
        <Show when={getRaceStatus() === "finished"}>
          <div class="flex w-full flex-col items-center gap-6 rounded-double border border-main/30 bg-sub-alt/40 p-8 text-center shadow-2xl backdrop-blur-md">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-main/20 text-main shadow-[0_0_24px_var(--main-color)]">
              <Fa icon="fa-trophy" size={2} />
            </div>

            <div>
              <h2 class="text-3xl font-black text-text">
                Kompetisi Telah Selesai!
              </h2>
              <Show when={myRank() !== undefined}>
                {(rank) => (
                  <p class="mt-1 font-mono text-lg font-bold text-main">
                    Peringkat #{rank()} dari{" "}
                    {participants.filter((p) => !p.isTeacher).length} Siswa
                  </p>
                )}
              </Show>
            </div>

            {/* Final Stats Cards */}
            <div class="grid w-full max-w-md grid-cols-3 gap-3">
              <div class="rounded-radius flex flex-col items-center border border-sub/20 bg-bg p-3">
                <span class="text-xs text-sub">WPM Terbaik</span>
                <span class="font-mono text-2xl font-black text-main">
                  {myParticipant()?.bestWpm ?? finalResult()?.wpm ?? 0}
                </span>
                <span class="text-[10px] text-sub">Skor Puncak</span>
              </div>

              <div class="rounded-radius flex flex-col items-center border border-sub/20 bg-bg p-3">
                <span class="text-xs text-sub">Akurasi</span>
                <span class="font-mono text-2xl font-black text-text">
                  {myParticipant()?.bestAccuracy ??
                    finalResult()?.accuracy ??
                    100}
                  %
                </span>
                <span class="text-[10px] text-sub">Tepat</span>
              </div>

              <div class="rounded-radius flex flex-col items-center border border-sub/20 bg-bg p-3">
                <span class="text-xs text-sub">Total Putaran</span>
                <span class="font-mono text-2xl font-black text-text">
                  {myParticipant()?.attemptsCount ?? 1}
                </span>
                <span class="text-[10px] text-sub">Percobaan</span>
              </div>
            </div>

            <div class="rounded-radius border border-sub/20 bg-bg/60 p-4 text-xs text-sub">
              <Fa icon="fa-tv" class="mr-2 text-main" />
              <span>
                Lihat animasi peringkat dan podium juara kelas di layar utama
                proyektor!
              </span>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
}
