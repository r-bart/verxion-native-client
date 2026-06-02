import { SignInWithAppleUseCase } from "../SignInWithAppleUseCase";
import type { IAuthPort } from "@/domain/auth/ports/IAuthPort";
import type { SessionData } from "@/domain/auth/models/AuthUser";

describe("SignInWithAppleUseCase", () => {
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
      signInWithApple: jest.fn().mockResolvedValue(mockSession),
      signInEmail: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      ...overrides,
    };
  }

  it("delegates to the port and returns the session", async () => {
    const port = createMockPort();
    const uc = new SignInWithAppleUseCase(port);

    const result = await uc.execute();

    expect(port.signInWithApple).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockSession);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      signInWithApple: jest.fn().mockRejectedValue(new Error("bad token")),
    });
    const uc = new SignInWithAppleUseCase(port);
    await expect(uc.execute()).rejects.toThrow("bad token");
  });
});
