import {
  createEffect,
  createMemo,
  createSignal,
  Index,
  JSXElement,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import {
  sendFinish,
  sendNextAttempt,
  sendProgress,
} from "../../../services/race-socket";
import {
  getMyName,
  getMyParticipantId,
  getPassageAuthor,
  getPassageText,
  getRaceStatus,
  getRemainingSeconds,
  participants,
} from "../../../states/race";
import { cn } from "../../../utils/cn";
import { Button } from "../../common/Button";
import { Fa } from "../../common/Fa";

export type RaceTypingArenaProps = {
  onComplete?: (wpm: number, accuracy: number, timeSec: number) => void;
};

export function RaceTypingArena(props: RaceTypingArenaProps): JSXElement {
  let containerRef: HTMLDivElement | undefined;
  let inputRef: HTMLInputElement | undefined;

  const [typed, setTyped] = createSignal("");
  const [mistakes, setMistakes] = createSignal(0);
  const [totalKeys, setTotalKeys] = createSignal(0);
  const [startTime, setStartTime] = createSignal<number>(Date.now());
  const [liveWpm, setLiveWpm] = createSignal(0);
  const [liveAccuracy, setLiveAccuracy] = createSignal(100);
  const [isFinished, setIsFinished] = createSignal(false);

  const targetText = createMemo(() => getPassageText());
  const totalLength = createMemo(() => {
    const len = targetText().length;
    return len > 0 ? len : 1;
  });

  const progressPercent = createMemo(() => {
    const len = typed().length;
    return Math.min(100, Math.round((len / totalLength()) * 100));
  });

  const myParticipant = createMemo(() =>
    participants.find(
      (p) => p.id === getMyParticipantId() || p.name === getMyName(),
    ),
  );

  createEffect(() => {
    targetText();
    if (containerRef) {
      containerRef.scrollTop = 0;
    }
  });

  onMount(() => {
    setStartTime(Date.now());
    if (inputRef) {
      inputRef.focus();
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Enter" && isFinished() && getRemainingSeconds() > 0) {
        e.preventDefault();
        handleStartNextAttempt();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  const handleArenaClick = (): void => {
    if (
      inputRef &&
      !isFinished() &&
      getRemainingSeconds() > 0 &&
      getRaceStatus() === "racing"
    ) {
      inputRef.focus();
    }
  };

  const adjustAutoScroll = (): void => {
    if (!containerRef) return;
    const currentSpan = containerRef.querySelector(
      '[data-current="true"]',
    ) as HTMLElement | null;
    if (!currentSpan) return;

    const currentTop = currentSpan.offsetTop;
    const paddingTop = 24;
    const lineHeight = 39;
    const lineIndex = Math.max(
      0,
      Math.floor((currentTop - paddingTop) / lineHeight),
    );

    // Auto-scroll when nearing the 3rd visible line (lineIndex >= 2)
    if (lineIndex >= 2) {
      const targetScroll = (lineIndex - 1) * lineHeight;
      if (Math.abs(containerRef.scrollTop - targetScroll) > 4) {
        containerRef.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });
      }
    } else if (containerRef.scrollTop > 0) {
      containerRef.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleInput = (
    e: InputEvent & { currentTarget: HTMLInputElement },
  ): void => {
    if (
      isFinished() ||
      getRemainingSeconds() <= 0 ||
      getRaceStatus() !== "racing"
    ) {
      return;
    }

    const val = e.currentTarget.value;
    const prevLen = typed().length;
    const newLen = val.length;

    if (newLen > prevLen) {
      setTotalKeys((k) => k + (newLen - prevLen));
      const targetChar = targetText()[newLen - 1];
      const typedChar = val[newLen - 1];
      if (targetChar !== typedChar) {
        setMistakes((m) => m + 1);
      }
    }

    setTyped(val);

    const elapsedMinutes = Math.max(0.001, (Date.now() - startTime()) / 60000);
    const calculatedWpm = Math.max(
      0,
      Math.round(val.length / 5 / elapsedMinutes),
    );
    setLiveWpm(calculatedWpm);

    const acc =
      totalKeys() > 0
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(((totalKeys() - mistakes()) / totalKeys()) * 100),
            ),
          )
        : 100;
    setLiveAccuracy(acc);

    const currentProg = Math.min(
      100,
      Math.round((val.length / totalLength()) * 100),
    );
    sendProgress(currentProg, calculatedWpm, acc);

    requestAnimationFrame(adjustAutoScroll);

    if (val.length >= targetText().length && targetText().length > 0) {
      completeTest(calculatedWpm, acc);
    }
  };

  const completeTest = (finalWpm: number, finalAcc: number): void => {
    if (isFinished()) return;
    setIsFinished(true);

    const elapsedSec = Math.round((Date.now() - startTime()) / 1000);
    sendFinish(finalWpm, finalAcc, elapsedSec);
    props.onComplete?.(finalWpm, finalAcc, elapsedSec);
  };

  const handleStartNextAttempt = (): void => {
    sendNextAttempt();
    setTyped("");
    setMistakes(0);
    setTotalKeys(0);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setStartTime(Date.now());
    setIsFinished(false);
    if (containerRef) {
      containerRef.scrollTo({ top: 0, behavior: "smooth" });
    }
    setTimeout(() => {
      inputRef?.focus();
    }, 50);
  };

  createEffect(() => {
    if (
      (getRemainingSeconds() <= 0 || getRaceStatus() === "finished") &&
      !isFinished()
    ) {
      completeTest(liveWpm(), liveAccuracy());
    }
  });

  return (
    <div class="flex w-full flex-col gap-6" onClick={handleArenaClick}>
      {/* HUD Bar */}
      <div class="rounded-radius flex flex-wrap items-center justify-between gap-4 border border-sub/20 bg-sub-alt/40 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-6">
          <div class="flex flex-col">
            <span class="text-xs tracking-wider text-sub uppercase">
              Kecepatan
            </span>
            <div class="flex items-baseline gap-1">
              <span class="font-mono text-3xl font-extrabold text-main transition-all">
                {liveWpm()}
              </span>
              <span class="text-xs font-semibold text-sub">WPM</span>
            </div>
          </div>

          <div class="h-8 w-px bg-sub/20"></div>

          <div class="flex flex-col">
            <span class="text-xs tracking-wider text-sub uppercase">
              Akurasi
            </span>
            <div class="flex items-baseline gap-1">
              <span class="font-mono text-3xl font-extrabold text-text">
                {liveAccuracy()}%
              </span>
            </div>
          </div>

          <Show when={(myParticipant()?.attemptsCount ?? 0) > 0}>
            <div class="h-8 w-px bg-sub/20"></div>
            <div class="flex flex-col">
              <span class="text-xs tracking-wider text-main uppercase">
                Best WPM
              </span>
              <div class="flex items-baseline gap-1">
                <span class="font-mono text-2xl font-black text-main">
                  {myParticipant()?.bestWpm ?? liveWpm()}
                </span>
                <span class="text-[10px] text-sub">
                  (Putaran {myParticipant()?.attemptsCount ?? 1})
                </span>
              </div>
            </div>
          </Show>
        </div>

        {/* Center: Live Smooth Progress Bar */}
        <div class="flex min-w-[150px] flex-1 flex-col items-center gap-1.5 px-4">
          <div class="flex w-full justify-between text-xs text-sub">
            <span>Kemajuan Paragraf</span>
            <span class="font-mono font-bold text-main">
              {progressPercent()}%
            </span>
          </div>
          <div class="h-3 w-full overflow-hidden rounded-full border border-sub/20 bg-sub-alt p-0.5">
            <div
              class="h-full rounded-full bg-main shadow-[0_0_12px_var(--main-color)] transition-all duration-150 ease-out"
              style={{ width: `${progressPercent()}%` }}
            ></div>
          </div>
        </div>

        {/* Right: Sisa Waktu Kompetisi */}
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-end">
            <span class="text-xs tracking-wider text-sub uppercase">
              Sisa Waktu
            </span>
            <div class="flex items-center gap-2">
              <Fa icon="fa-stopwatch" class="text-sub" />
              <span
                class={cn("font-mono text-3xl font-black transition-colors", {
                  "animate-pulse text-error": getRemainingSeconds() <= 10,
                  "text-main": getRemainingSeconds() > 10,
                })}
              >
                {getRemainingSeconds()}s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Typing Container or Multi-attempt Banner */}
      <Show
        when={!isFinished() || getRemainingSeconds() <= 0}
        fallback={
          <div class="flex flex-col items-center gap-5 rounded-double border-2 border-main/50 bg-sub-alt/90 p-8 text-center shadow-2xl backdrop-blur-md">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-main/20 text-2xl text-main shadow-[0_0_20px_var(--main-color)]">
              <Fa icon="fa-check-circle" />
            </div>

            <div>
              <h3 class="text-2xl font-black text-text">
                Putaran Ini Berhasil Diselesaikan!
              </h3>
              <p class="mt-1 text-sm text-sub">
                Waktu kompetisi masih tersisa{" "}
                <span class="font-mono font-bold text-main">
                  {getRemainingSeconds()} detik
                </span>
                . Anda bisa mengetik lagi untuk melampaui skor sebelumnya!
              </p>
            </div>

            <div class="rounded-radius flex items-center justify-center gap-8 border border-sub/20 bg-bg/80 px-6 py-4">
              <div class="flex flex-col items-center">
                <span class="text-xs text-sub uppercase">Putaran Barusan</span>
                <span class="font-mono text-3xl font-extrabold text-text">
                  {liveWpm()}
                </span>
                <span class="text-xs text-sub">{liveAccuracy()}% Akurasi</span>
              </div>
              <div class="h-10 w-px bg-sub/30"></div>
              <div class="flex flex-col items-center">
                <span class="text-xs font-bold text-main uppercase">
                  Skor Tertinggi (Best WPM)
                </span>
                <span class="font-mono text-4xl font-black text-main">
                  {myParticipant()?.bestWpm ?? liveWpm()}
                </span>
                <span class="text-xs text-sub">Dicatat di Papan Peringkat</span>
              </div>
            </div>

            <Button
              variant="text"
              class="rounded-radius flex items-center gap-2 bg-main px-8 py-3.5 text-base font-bold text-bg shadow-[0_4px_16px_var(--main-color)] transition-all hover:brightness-110 active:scale-95"
              onClick={handleStartNextAttempt}
            >
              <Fa icon="fa-redo-alt" />
              <span>Ketik Putaran Berikutnya (Enter)</span>
            </Button>
          </div>
        }
      >
        <div class="flex flex-col gap-3">
          <div
            ref={(el) => (containerRef = el)}
            class="relative h-[185px] cursor-text overflow-y-auto scroll-smooth rounded-double border border-sub/20 bg-bg/90 p-6 shadow-inner transition-all select-none hover:border-sub/40"
            onClick={handleArenaClick}
          >
            <input
              ref={(el) => (inputRef = el)}
              type="text"
              class="pointer-events-none absolute top-0 left-0 h-0 w-0 opacity-0"
              value={typed()}
              onInput={handleInput}
              autocomplete="off"
              // oxlint-disable-next-line react/no-unknown-property
              autocapitalize="off"
              // oxlint-disable-next-line react/no-unknown-property
              spellcheck={false}
              disabled={
                isFinished() ||
                getRemainingSeconds() <= 0 ||
                getRaceStatus() !== "racing"
              }
            />

            <div class="relative font-mono text-2xl leading-relaxed tracking-wide select-none">
              <Index each={targetText().split("")}>
                {(char, index) => {
                  const isTyped = () => index < typed().length;
                  const isCurrent = () => index === typed().length;
                  const isCorrect = () =>
                    isTyped() && typed()[index] === char();
                  const isError = () => isTyped() && !isCorrect();

                  return (
                    <span
                      data-current={isCurrent() ? "true" : undefined}
                      class={cn("relative transition-colors duration-75", {
                        "font-medium text-text": isCorrect(),
                        "rounded-xs bg-error/20 px-0.5 text-error": isError(),
                        "text-sub opacity-50": !isTyped() && !isCurrent(),
                        "font-semibold text-main": isCurrent(),
                      })}
                    >
                      <Show when={isCurrent() && !isFinished()}>
                        <span class="absolute top-[10%] -left-[2px] h-[80%] w-[3px] animate-pulse rounded-full bg-caret shadow-[0_0_8px_var(--caret-color)]"></span>
                      </Show>
                      {char()}
                    </span>
                  );
                }}
              </Index>
            </div>
          </div>

          <Show when={getPassageAuthor().length > 0}>
            <div class="flex items-center justify-end gap-2 px-2 text-sm text-sub italic">
              <span>—</span>
              <span class="font-medium text-main/90">{getPassageAuthor()}</span>
            </div>
          </Show>
        </div>
      </Show>

      <div class="flex items-center justify-center gap-2 text-xs text-sub">
        <Fa icon="fa-keyboard" class="opacity-70" />
        <span>
          Ketik paragraf di atas secepat dan seakurat mungkin. Posisi balapan
          dan WPM terbaik Anda terupdate secara live!
        </span>
      </div>
    </div>
  );
}
