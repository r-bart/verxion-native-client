import { GetSessionUseCase } from "../GetSessionUseCase";
import type { IAuthPort } from "@/domain/auth/ports/IAuthPort";
import type { SessionData } from "@/domain/auth/models/AuthUser";

describe("GetSessionUseCase", () => {
  const mockSession: SessionData = {
    user: {
      id: "user-1",
      email: "test@example.com",
      name: "Test",
      image: null,
      emailVerified: true,
    },
    session: { token: "tok", userId: "user-1", expiresAt: new Date() },
  };

  function createMockPort(overrides: Partial<IAuthPort> = {}): IAuthPort {
    return {
      signInWithGoogle: jest.fn(),
      signInWithApple: jest.fn(),
      signInEmail: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn().mockResolvedValue(mockSession),
      ...overrides,
    };
  }

  it("calls port.getSession", async () => {
    const port = createMockPort();
    const uc = new GetSessionUseCase(port);
    const result = await uc.execute();

    expect(port.getSession).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockSession);
  });

  it("returns null when no session", async () => {
    const port = createMockPort({
      getSession: jest.fn().mockResolvedValue(null),
    });
    const uc = new GetSessionUseCase(port);
    const result = await uc.execute();
    expect(result).toBeNull();
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getSession: jest.fn().mockRejectedValue(new Error("Unauthorized")),
    });
    const uc = new GetSessionUseCase(port);
    await expect(uc.execute()).rejects.toThrow("Unauthorized");
  });
});
