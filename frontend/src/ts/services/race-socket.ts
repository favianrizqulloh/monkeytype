import confetti from "canvas-confetti";
import {
  addOrUpdateParticipant,
  getMyParticipantId,
  RaceParticipantState,
  removeParticipantById,
  setCountdownSeconds,
  setLeaderboard,
  setMyParticipantId,
  setParticipants,
  setPassageAuthor,
  setPassageText,
  setRaceStatus,
  setRemainingSeconds,
  setSessionDuration,
  updateParticipantProgress,
} from "../states/race";

let socket: WebSocket | null = null;
let raceTimerInterval: number | undefined;

export function connectRaceSocket(): WebSocket {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return socket;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws/race`;

  socket = new WebSocket(wsUrl);

  socket.onmessage = (event: MessageEvent<string>): void => {
    try {
      const msg = JSON.parse(event.data) as Record<string, unknown>;
      handleServerMessage(msg);
    } catch (e) {
      console.error("Error parsing WS message:", e);
    }
  };

  socket.onclose = () => {
    clearInterval(raceTimerInterval);
  };

  socket.onerror = (err) => {
    console.warn("Race WS error:", err);
  };

  return socket;
}

function handleServerMessage(msg: Record<string, unknown>): void {
  switch (msg["event"]) {
    case "room_state": {
      const session = msg["session"] as {
        id: string;
        status: "lobby" | "countdown" | "racing" | "finished";
        text: string;
        author?: string;
        durationSeconds: number;
        participants: RaceParticipantState[];
      };
      setMyParticipantId(msg["participantId"] as string);
      setRaceStatus(session.status);
      setPassageText(session.text);
      setPassageAuthor(session.author ?? "");
      setRemainingSeconds(session.durationSeconds ?? 180);
      setSessionDuration(session.durationSeconds ?? 180);
      setParticipants(session.participants);

      const finishedParticipants = session.participants
        .filter((p) => !p.isTeacher && (p.finished || (p.bestWpm ?? 0) > 0))
        .sort((a, b) => (b.bestWpm ?? 0) - (a.bestWpm ?? 0));
      setLeaderboard(finishedParticipants);
      break;
    }

    case "participant_joined": {
      const p = msg["participant"] as RaceParticipantState;
      addOrUpdateParticipant(p);
      break;
    }

    case "participant_left": {
      const id = msg["id"] as string;
      removeParticipantById(id);
      break;
    }

    case "race_countdown": {
      const seconds = msg["seconds"] as number;
      setRaceStatus("countdown");
      setCountdownSeconds(seconds);
      break;
    }

    case "race_start": {
      setRaceStatus("racing");
      setPassageText(msg["text"] as string);
      setPassageAuthor((msg["author"] as string) ?? "");
      const duration = (msg["durationSeconds"] as number) ?? 180;
      setRemainingSeconds(duration);
      setSessionDuration(duration);

      // Start local race timer decrement
      clearInterval(raceTimerInterval);
      raceTimerInterval = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(raceTimerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      break;
    }

    case "progress_update": {
      const id = msg["id"] as string;
      const progress = msg["progress"] as number;
      const wpm = msg["wpm"] as number;
      const accuracy = msg["accuracy"] as number;
      updateParticipantProgress(id, progress, wpm, accuracy);
      break;
    }

    case "timer_sync": {
      const remainingSeconds = msg["remainingSeconds"] as number;
      setRemainingSeconds(remainingSeconds);
      if (remainingSeconds <= 0) {
        clearInterval(raceTimerInterval);
      }
      break;
    }

    case "participant_finished": {
      const p = msg["participant"] as RaceParticipantState;
      addOrUpdateParticipant(p);
      if (Array.isArray(msg["leaderboard"])) {
        setLeaderboard(msg["leaderboard"] as RaceParticipantState[]);
      }
      if (p.id === getMyParticipantId()) {
        try {
          void confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {}
      }
      break;
    }

    case "next_attempt_ready": {
      const text = (msg["text"] as string) ?? "";
      const author = (msg["author"] as string) ?? "";
      setPassageText(text);
      setPassageAuthor(author);
      break;
    }

    case "race_finished": {
      clearInterval(raceTimerInterval);
      setRaceStatus("finished");
      if (Array.isArray(msg["leaderboard"])) {
        setLeaderboard(msg["leaderboard"] as RaceParticipantState[]);
      }
      try {
        void confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
        });
      } catch {}
      break;
    }

    case "race_reset": {
      clearInterval(raceTimerInterval);
      const session = msg["session"] as {
        text: string;
        author?: string;
        durationSeconds: number;
        participants: RaceParticipantState[];
      };
      setRaceStatus("lobby");
      setPassageText(session.text);
      setPassageAuthor(session.author ?? "");
      const duration = session.durationSeconds ?? 180;
      setRemainingSeconds(duration);
      setSessionDuration(duration);
      setParticipants(session.participants);
      setLeaderboard([]);
      break;
    }
  }
}

export type RaceConfigOptions = {
  durationSeconds?: number;
  mode?: "time" | "words" | "quote" | "custom";
  modeValue?: number;
  language?: "indonesian" | "english";
  punctuation?: boolean;
  numbers?: boolean;
  customText?: string;
};

export function joinRoom(
  sessionId: string,
  name: string,
  isTeacher: boolean,
  options?: RaceConfigOptions,
): void {
  const ws = connectRaceSocket();
  const send = (): void => {
    ws.send(
      JSON.stringify({
        action: "join",
        sessionId,
        name,
        isTeacher,
        durationSeconds: options?.durationSeconds,
        mode: options?.mode,
        modeValue: options?.modeValue,
        language: options?.language,
        punctuation: options?.punctuation,
        numbers: options?.numbers,
        customText: options?.customText,
      }),
    );
  };

  if (ws.readyState === WebSocket.OPEN) {
    send();
  } else {
    ws.addEventListener("open", send, { once: true });
  }
}

export function sendProgress(
  progress: number,
  wpm: number,
  accuracy: number,
): void {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        action: "progress",
        progress,
        wpm,
        accuracy,
      }),
    );
  }
}

export function sendFinish(
  wpm: number,
  accuracy: number,
  durationSeconds: number,
): void {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        action: "finish",
        wpm,
        accuracy,
        durationSeconds,
      }),
    );
  }
}

export function sendNextAttempt(): void {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        action: "next_attempt",
      }),
    );
  }
}

export function startRace(options?: RaceConfigOptions | number): void {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const payload =
      typeof options === "number"
        ? { action: "start_race", durationSeconds: options }
        : { action: "start_race", ...options };
    socket.send(JSON.stringify(payload));
  }
}

export function resetRace(
  options?: RaceConfigOptions | string,
  durationSeconds?: number,
): void {
  if (socket && socket.readyState === WebSocket.OPEN) {
    let payload: Record<string, unknown>;
    if (typeof options === "string" || durationSeconds !== undefined) {
      payload = {
        action: "reset_race",
        customText: typeof options === "string" ? options : undefined,
        durationSeconds,
      };
    } else {
      payload = {
        action: "reset_race",
        ...options,
      };
    }
    socket.send(JSON.stringify(payload));
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (
    typeof navigator?.clipboard?.writeText === "function" &&
    window.isSecureContext
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // Fallback for HTTP LAN environments / older browsers
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    // oxlint-disable-next-line typescript/no-deprecated
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    return false;
  }
}

export function disconnectRaceSocket(): void {
  clearInterval(raceTimerInterval);
  if (socket) {
    socket.close();
    socket = null;
  }
}
