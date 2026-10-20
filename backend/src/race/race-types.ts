export type RaceParticipant = {
  id: string;
  name: string;
  isTeacher: boolean;
  progress: number; // 0 - 100
  wpm: number;
  accuracy: number;
  finished: boolean;
  finishTime?: number; // timestamp in ms when finished
  durationSeconds?: number;
  rank?: number;
  bestWpm: number; // highest WPM achieved in this session
  bestAccuracy: number; // accuracy of the best attempt
  attemptsCount: number; // how many times the student completed a passage
};

export type RaceSessionStatus = "lobby" | "countdown" | "racing" | "finished";

export type RaceSession = {
  id: string; // Session code, e.g. "908235"
  status: RaceSessionStatus;
  createdAt: number;
  text: string;
  author?: string;
  durationSeconds: number; // default 180s
  startTime?: number; // timestamp when racing started
  countdownValue?: number; // 3, 2, 1
  mode?: "time" | "words" | "quote" | "custom";
  modeValue?: number;
  language?: "indonesian" | "english";
  punctuation?: boolean;
  numbers?: boolean;
  customText?: string;
  participants: Map<string, RaceParticipant>;
};

export type ClientJoinMessage = {
  action: "join";
  sessionId: string;
  name: string;
  isTeacher: boolean;
  durationSeconds?: number;
  mode?: "time" | "words" | "quote" | "custom";
  modeValue?: number;
  language?: "indonesian" | "english";
  punctuation?: boolean;
  numbers?: boolean;
  customText?: string;
};

export type ClientProgressMessage = {
  action: "progress";
  progress: number;
  wpm: number;
  accuracy: number;
};

export type ClientFinishMessage = {
  action: "finish";
  wpm: number;
  accuracy: number;
  durationSeconds: number;
};

export type ClientNextAttemptMessage = {
  action: "next_attempt";
};

export type ClientStartRaceMessage = {
  action: "start_race";
  countdownSeconds?: number;
  durationSeconds?: number;
  mode?: "time" | "words" | "quote" | "custom";
  modeValue?: number;
  language?: "indonesian" | "english";
  punctuation?: boolean;
  numbers?: boolean;
  customText?: string;
};

export type ClientResetRaceMessage = {
  action: "reset_race";
  customText?: string;
  durationSeconds?: number;
  mode?: "time" | "words" | "quote" | "custom";
  modeValue?: number;
  language?: "indonesian" | "english";
  punctuation?: boolean;
  numbers?: boolean;
};

export type ClientMessage =
  | ClientJoinMessage
  | ClientProgressMessage
  | ClientFinishMessage
  | ClientNextAttemptMessage
  | ClientStartRaceMessage
  | ClientResetRaceMessage;

export type SerializedSession = {
  id: string;
  status: RaceSessionStatus;
  text: string;
  author?: string;
  durationSeconds: number;
  startTime?: number;
  countdownValue?: number;
  mode?: "time" | "words" | "quote" | "custom";
  modeValue?: number;
  language?: "indonesian" | "english";
  punctuation?: boolean;
  numbers?: boolean;
  customText?: string;
  participants: RaceParticipant[];
};

export type ServerRoomStateMessage = {
  event: "room_state";
  session: SerializedSession;
  participantId: string;
};

export type ServerParticipantJoinedMessage = {
  event: "participant_joined";
  participant: RaceParticipant;
};

export type ServerParticipantLeftMessage = {
  event: "participant_left";
  id: string;
};

export type ServerCountdownMessage = {
  event: "race_countdown";
  seconds: number;
};

export type ServerStartMessage = {
  event: "race_start";
  startTime: number;
  text: string;
  author?: string;
  durationSeconds: number;
};

export type ServerProgressUpdateMessage = {
  event: "progress_update";
  id: string;
  progress: number;
  wpm: number;
  accuracy: number;
};

export type ServerParticipantFinishedMessage = {
  event: "participant_finished";
  participant: RaceParticipant;
  leaderboard: RaceParticipant[];
};

export type ServerRaceFinishedMessage = {
  event: "race_finished";
  leaderboard: RaceParticipant[];
};

export type ServerRaceResetMessage = {
  event: "race_reset";
  session: SerializedSession;
};

export type ServerTimerSyncMessage = {
  event: "timer_sync";
  remainingSeconds: number;
};

export type ServerMessage =
  | ServerRoomStateMessage
  | ServerParticipantJoinedMessage
  | ServerParticipantLeftMessage
  | ServerCountdownMessage
  | ServerStartMessage
  | ServerProgressUpdateMessage
  | ServerParticipantFinishedMessage
  | ServerRaceFinishedMessage
  | ServerRaceResetMessage
  | ServerTimerSyncMessage;
