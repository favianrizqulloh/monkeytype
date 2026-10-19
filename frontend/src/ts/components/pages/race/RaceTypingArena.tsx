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

import { sendFinish, sendProgress } from "../../../services/race-socket";
import {
  getPassageAuthor,
  getPassageText,
  getRemainingSeconds,
} from "../../../states/race";
import { cn } from "../../../utils/cn";
import { Fa } from "../../common/Fa";

export type RaceTypingArenaProps = {
  onComplete?: (wpm: number, accuracy: number, timeSec: number) => void;
};

export function RaceTypingArena(props: RaceTypingArenaProps): JSXElement {
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

  onMount(() => {
    setStartTime(Date.now());
    if (inputRef) {
      inputRef.focus();
    }
  });

  const handleArenaClick = (): void => {
    if (inputRef && !isFinished()) {
      inputRef.focus();
    }
  };

  const handleInput = (
    e: InputEvent & { currentTarget: HTMLInputElement },
  ): void => {
    if (isFinished()) return;

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

  createEffect(() => {
    if (getRemainingSeconds() <= 0 && !isFinished()) {
      completeTest(liveWpm(), liveAccuracy());
    }
  });

  onCleanup(() => {
    // cleanup
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
        </div>

        {/* Center: Live Smooth Progress Bar */}
        <div class="flex min-w-[150px] flex-1 flex-col items-center gap-1.5 px-4">
          <div class="flex w-full justify-between text-xs text-sub">
            <span>Kemajuan Mengetik</span>
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

        {/* Right: 60s Countdown Timer */}
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

      {/* Main Typing Container */}
      <div class="relative min-h-[160px] cursor-text rounded-double border border-sub/20 bg-bg/90 p-8 shadow-inner transition-all hover:border-sub/40">
        <input
          ref={(el) => (inputRef = el)}
          type="text"
          class="pointer-events-auto absolute inset-0 h-full w-full cursor-text opacity-0"
          value={typed()}
          onInput={handleInput}
          autocomplete="off"
          // oxlint-disable-next-line react/no-unknown-property
          autocapitalize="off"
          // oxlint-disable-next-line react/no-unknown-property
          spellcheck={false}
          disabled={isFinished()}
        />

        <div class="relative font-mono text-2xl leading-relaxed tracking-wide select-none">
          <Index each={targetText().split("")}>
            {(char, index) => {
              const isTyped = () => index < typed().length;
              const isCurrent = () => index === typed().length;
              const isCorrect = () => isTyped() && typed()[index] === char();
              const isError = () => isTyped() && !isCorrect();

              return (
                <span
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

        <Show when={getPassageAuthor().length > 0}>
          <div class="mt-6 flex items-center justify-end gap-2 text-sm text-sub italic">
            <span>—</span>
            <span>{getPassageAuthor()}</span>
          </div>
        </Show>
      </div>

      <div class="flex items-center justify-center gap-2 text-xs text-sub">
        <Fa icon="fa-keyboard" class="opacity-70" />
        <span>
          Ketik paragraf di atas secepat dan seakurat mungkin. Posisi balapan
          Anda diupdate secara live!
        </span>
      </div>
    </div>
  );
}
