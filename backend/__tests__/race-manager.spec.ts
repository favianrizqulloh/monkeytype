import { describe, it, expect, beforeEach } from "vitest";
import { RaceManager } from "../src/race/race-manager";

describe("RaceManager", () => {
  let manager: RaceManager;

  beforeEach(() => {
    manager = new RaceManager();
  });

  it("creates a new session with Indonesian text and 180-second default duration", () => {
    const session = manager.getOrCreateSession("session123");
    expect(session.id).toBe("session123");
    expect(session.status).toBe("lobby");
    expect(session.durationSeconds).toBe(180);
    expect(session.text.length).toBeGreaterThan(10);
    expect(session.author).toBeDefined();
  });

  it("allows participants to join as student or teacher", () => {
    const s1 = manager.joinParticipant("s1", "p1", "Budi Santoso", false);
    expect(s1.name).toBe("Budi Santoso");
    expect(s1.isTeacher).toBe(false);
    expect(s1.progress).toBe(0);

    const teacher = manager.joinParticipant("s1", "t1", "Guru Komputer", true);
    expect(teacher.isTeacher).toBe(true);

    const session = manager.getSession("s1");
    expect(session?.participants.size).toBe(2);
  });

  it("updates participant progress during race", () => {
    manager.joinParticipant("s1", "p1", "Budi", false);
    const session = manager.getSession("s1");
    expect(session).toBeDefined();
    if (!session) return;
    session.status = "racing";

    const updated = manager.updateProgress("s1", "p1", 45.6, 75, 98);
    expect(updated?.progress).toBe(46);
    expect(updated?.wpm).toBe(75);
    expect(updated?.accuracy).toBe(98);
  });

  it("finishes participants and assigns ranks based on best WPM", () => {
    manager.joinParticipant("s1", "p1", "Budi", false);
    manager.joinParticipant("s1", "p2", "Siti", false);
    const session = manager.getSession("s1");
    expect(session).toBeDefined();
    if (!session) return;
    session.status = "racing";

    // P2 finishes first with 90 WPM
    const res1 = manager.finishParticipant("s1", "p2", 90, 100, 25);
    expect(res1?.participant.bestWpm).toBe(90);
    expect(res1?.participant.finished).toBe(true);
    expect(res1?.participant.rank).toBe(1);

    // P1 finishes with 80 WPM
    const res2 = manager.finishParticipant("s1", "p1", 80, 95, 30);
    expect(res2?.participant.bestWpm).toBe(80);
    expect(res2?.participant.rank).toBe(2);

    // P1 attempts again and gets 95 WPM -> P1 rank becomes 1!
    const nextAttempt = manager.startNextAttempt("s1", "p1");
    expect(nextAttempt?.passage.text.length).toBeGreaterThan(10);
    expect(session.participants.get("p1")?.finished).toBe(false);
    expect(session.participants.get("p1")?.bestWpm).toBe(80);

    const res3 = manager.finishParticipant("s1", "p1", 95, 98, 28);
    expect(res3?.participant.bestWpm).toBe(95);

    const lb = manager.getLeaderboard(session);
    expect(lb[0]?.id).toBe("p1"); // P1 is now 1st with 95 WPM
    expect(lb[0]?.bestWpm).toBe(95);
    expect(lb[1]?.id).toBe("p2"); // P2 is 2nd with 90 WPM
    expect(lb[1]?.bestWpm).toBe(90);
  });

  it("resets race state and generates new passage", () => {
    manager.joinParticipant("s1", "p1", "Budi", false);
    const session = manager.getSession("s1");
    expect(session).toBeDefined();
    if (!session) return;
    session.status = "racing";
    manager.finishParticipant("s1", "p1", 80, 95, 30);

    const resetSession = manager.resetRace("s1");
    expect(resetSession?.status).toBe("lobby");
    expect(resetSession?.participants[0]?.progress).toBe(0);
    expect(resetSession?.participants[0]?.finished).toBe(false);
    expect(resetSession?.participants[0]?.rank).toBeUndefined();
  });

  it("supports mode selection, English language, and custom text", () => {
    // Custom text
    const customSession = manager.getOrCreateSession("custom1", {
      mode: "custom",
      customText: "Ketik teks ini untuk latihan kustom kelas 10A.",
    });
    expect(customSession.text).toBe(
      "Ketik teks ini untuk latihan kustom kelas 10A.",
    );

    // Words mode with English & numbers
    const wordsSession = manager.getOrCreateSession("words1", {
      mode: "words",
      modeValue: 15,
      language: "english",
      numbers: true,
      punctuation: true,
    });
    expect(wordsSession.text.split(" ").length).toBe(15);
  });

  it("supports 5-minute (300s) and 10-minute (600s) duration sessions with ample passages", () => {
    const s5 = manager.getOrCreateSession("session-5m", {
      durationSeconds: 300,
      mode: "time",
      modeValue: 300,
    });
    expect(s5.durationSeconds).toBe(300);
    expect(s5.text.split(" ").length).toBeGreaterThanOrEqual(250);

    const s10 = manager.getOrCreateSession("session-10m", {
      durationSeconds: 600,
      mode: "time",
      modeValue: 600,
    });
    expect(s10.durationSeconds).toBe(600);
    expect(s10.text.split(" ").length).toBeGreaterThanOrEqual(450);
  });

  it("scales quote passages with duration and returns fresh quote on next attempt", () => {
    const qSession = manager.getOrCreateSession("quote-session", {
      mode: "quote",
      durationSeconds: 180,
    });
    expect(qSession.text.split(" ").length).toBeGreaterThanOrEqual(180);

    qSession.status = "racing";
    manager.joinParticipant("quote-session", "p1", "Siswa", false);

    const next1 = manager.startNextAttempt("quote-session", "p1");
    expect(next1).toBeDefined();
    expect(next1?.passage.text.length).toBeGreaterThan(50);
  });
});
