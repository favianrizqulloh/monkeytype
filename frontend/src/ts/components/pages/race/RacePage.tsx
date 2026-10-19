import {
  createMemo,
  createSignal,
  For,
  JSXElement,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import { disconnectRaceSocket, joinRoom } from "../../../services/race-socket";
import {
  getMyName,
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
  const [finalResult, setFinalResult] = createSignal<{
    wpm: number;
    accuracy: number;
    timeSec: number;
  } | null>(null);

  onMount(() => {
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

  const myRank = createMemo(() => {
    const name = getMyName();
    const entry = leaderboard.find((p) => p.name === name);
    return entry?.rank;
  });

  return (
    <div class="mx-auto flex w-full max-w-4xl flex-col items-center justify-center py-8">
      {/* State 1: Join Form (Nama Lengkap & Kode Sesi) */}
      <Show when={!hasJoined()}>
        <div class="flex w-full max-w-md flex-col gap-6 rounded-double border border-sub/20 bg-sub-alt/30 p-8 shadow-xl backdrop-blur-md">
          <div class="flex flex-col items-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-main/10 text-main shadow-[0_0_20px_var(--main-color)]">
              <Fa icon="fa-flag-checkered" size={1.75} />
            </div>
            <h1 class="text-2xl font-black tracking-tight text-text">
              TypingTest Arena
            </h1>
            <p class="mt-1 text-sm text-sub">
              Kompetisi Mengetik Cepat Kelas Komputer
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
              <span>Gabung Lomba</span>
            </Button>
          </form>

          <p class="text-center text-xs text-sub">
            Murni untuk kelas belajar komputer. Tanpa login email atau SSO.
          </p>
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
              3
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
        <Show when={getRaceStatus() === "finished" || finalResult() !== null}>
          <div class="flex w-full flex-col items-center gap-6 rounded-double border border-main/30 bg-sub-alt/40 p-8 text-center shadow-2xl backdrop-blur-md">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-main/20 text-main shadow-[0_0_24px_var(--main-color)]">
              <Fa icon="fa-trophy" size={2} />
            </div>

            <div>
              <h2 class="text-3xl font-black text-text">Kamu Telah Selesai!</h2>
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
                <span class="text-xs text-sub">Kecepatan</span>
                <span class="font-mono text-2xl font-black text-main">
                  {finalResult()?.wpm ?? 0}
                </span>
                <span class="text-[10px] text-sub">WPM</span>
              </div>

              <div class="rounded-radius flex flex-col items-center border border-sub/20 bg-bg p-3">
                <span class="text-xs text-sub">Akurasi</span>
                <span class="font-mono text-2xl font-black text-text">
                  {finalResult()?.accuracy ?? 100}%
                </span>
                <span class="text-[10px] text-sub">Tepat</span>
              </div>

              <div class="rounded-radius flex flex-col items-center border border-sub/20 bg-bg p-3">
                <span class="text-xs text-sub">Waktu</span>
                <span class="font-mono text-2xl font-black text-text">
                  {finalResult()?.timeSec ?? 60}s
                </span>
                <span class="text-[10px] text-sub">Durasi</span>
              </div>
            </div>

            <div class="rounded-radius border border-sub/20 bg-bg/60 p-4 text-xs text-sub">
              <Fa icon="fa-tv" class="mr-2 text-main" />
              <span>
                Lihat papan skor animasi dan highlight podium juara di layar
                proyektor kelas!
              </span>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
}
