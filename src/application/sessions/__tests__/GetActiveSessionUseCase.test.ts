import { GetActiveSessionUseCase } from "../GetActiveSessionUseCase";
import type { ISessionPort } from "@/domain/sessions/ports/ISessionPort";
import type { Session } from "@/domain/sessions/models/Session";

describe("GetActiveSessionUseCase", () => {
  const mockSession: Session = {
    id: "sess-1",
    name: "Push Day",
    status: "in_progress",
    startedAt: "2026-03-27T08:00:00Z",
    completedAt: null,
  };

  function createMockPort(overrides: Partial<ISessionPort> = {}): ISessionPort {
    return {
      getActiveSession: jest.fn().mockResolvedValue(mockSession),
      getLiveProgress: jest.fn(),
      listSessions: jest.fn().mockResolvedValue([]),
      ...overrides,
    };
  }

  it("calls port.getActiveSession", async () => {
    const port = createMockPort();
    const uc = new GetActiveSessionUseCase(port);
    const result = await uc.execute();

    expect(port.getActiveSession).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockSession);
  });

  it("returns null when no active session", async () => {
    const port = createMockPort({
      getActiveSession: jest.fn().mockResolvedValue(null),
    });
    const uc = new GetActiveSessionUseCase(port);
    const result = await uc.execute();
    expect(result).toBeNull();
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getActiveSession: jest.fn().mockRejectedValue(new Error("Connection refused")),
    });
    const uc = new GetActiveSessionUseCase(port);
    await expect(uc.execute()).rejects.toThrow("Connection refused");
  });
});
