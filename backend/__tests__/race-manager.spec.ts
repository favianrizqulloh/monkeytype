import { describe, it, expect, beforeEach } from "vitest";
import { RaceManager } from "../src/race/race-manager";

describe("RaceManager", () => {
  let manager: RaceManager;

  beforeEach(() => {
    manager = new RaceManager();
  });

  it("creates a new session with Indonesian text and 60-second duration", () => {
    const session = manager.getOrCreateSession("session123");
    expect(session.id).toBe("session123");
    expect(session.status).toBe("lobby");
    expect(session.durationSeconds).toBe(60);
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
    const session = manager.getSession("s1")!;
    session.status = "racing";

    const updated = manager.updateProgress("s1", "p1", 45.6, 75, 98);
    expect(updated?.progress).toBe(46);
    expect(updated?.wpm).toBe(75);
    expect(updated?.accuracy).toBe(98);
  });

  it("finishes participants and assigns ranks in order", () => {
    manager.joinParticipant("s1", "p1", "Budi", false);
    manager.joinParticipant("s1", "p2", "Siti", false);
    const session = manager.getSession("s1")!;
    session.status = "racing";

    // P2 finishes first
    const res1 = manager.finishParticipant("s1", "p2", 90, 100, 25);
    expect(res1?.participant.rank).toBe(1);
    expect(res1?.participant.finished).toBe(true);
    expect(session.status).toBe("racing"); // p1 hasn't finished yet

    // P1 finishes second
    const res2 = manager.finishParticipant("s1", "p1", 80, 95, 30);
    expect(res2?.participant.rank).toBe(2);
    expect(res2?.participant.finished).toBe(true);

    // All finished -> session status = finished
    expect(session.status).toBe("finished");

    const lb = manager.getLeaderboard(session);
    expect(lb[0]!.id).toBe("p2");
    expect(lb[1]!.id).toBe("p1");
  });

  it("resets race state and generates new passage", () => {
    manager.joinParticipant("s1", "p1", "Budi", false);
    const session = manager.getSession("s1")!;
    session.status = "racing";
    manager.finishParticipant("s1", "p1", 80, 95, 30);

    const resetSession = manager.resetRace("s1");
    expect(resetSession?.status).toBe("lobby");
    expect(resetSession?.participants[0]!.progress).toBe(0);
    expect(resetSession?.participants[0]!.finished).toBe(false);
    expect(resetSession?.participants[0]!.rank).toBeUndefined();
  });
});
