import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

export type RaceParticipantState = {
  id: string;
  name: string;
  isTeacher: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finishTime?: number;
  durationSeconds?: number;
  rank?: number;
};

export type RaceStatus = "idle" | "lobby" | "countdown" | "racing" | "finished";

export const [getMyParticipantId, setMyParticipantId] =
  createSignal<string>("");
export const [getMyName, setMyName] = createSignal<string>("");
export const [getSessionId, setSessionId] = createSignal<string>("");
export const [getRaceStatus, setRaceStatus] = createSignal<RaceStatus>("idle");
export const [getPassageText, setPassageText] = createSignal<string>("");
export const [getPassageAuthor, setPassageAuthor] = createSignal<string>("");
export const [getCountdownSeconds, setCountdownSeconds] =
  createSignal<number>(3);
export const [getRemainingSeconds, setRemainingSeconds] =
  createSignal<number>(60);
export const [getIsTeacher, setIsTeacher] = createSignal<boolean>(false);

export const [participants, setParticipants] = createStore<
  RaceParticipantState[]
>([]);
export const [leaderboard, setLeaderboard] = createStore<
  RaceParticipantState[]
>([]);

export function resetRaceState(): void {
  setRaceStatus("idle");
  setPassageText("");
  setPassageAuthor("");
  setCountdownSeconds(3);
  setRemainingSeconds(60);
  setParticipants([]);
  setLeaderboard([]);
}

export function updateParticipantProgress(
  id: string,
  progress: number,
  wpm: number,
  accuracy: number,
): void {
  setParticipants(
    (p) => p.id === id,
    (prev) => ({
      ...prev,
      progress,
      wpm,
      accuracy,
    }),
  );
}

export function addOrUpdateParticipant(
  participant: RaceParticipantState,
): void {
  const index = participants.findIndex((p) => p.id === participant.id);
  if (index === -1) {
    setParticipants([...participants, participant]);
  } else {
    setParticipants(index, participant);
  }
}

export function removeParticipantById(id: string): void {
  setParticipants(participants.filter((p) => p.id !== id));
}
