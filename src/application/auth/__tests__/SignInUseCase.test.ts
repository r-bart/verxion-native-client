import { SignInUseCase } from "../SignInUseCase";
import type { IAuthPort } from "@/domain/auth/ports/IAuthPort";
import type { SessionData } from "@/domain/auth/models/AuthUser";

describe("SignInUseCase", () => {
  const mockSession: SessionData = {
    user: {
      id: "user-1",
      email: "reviewer@example.com",
      name: "Reviewer",
      image: null,
      emailVerified: true,
    },
    session: { token: "tok", userId: "user-1", expiresAt: new Date() },
  };

  function createMockPort(overrides: Partial<IAuthPort> = {}): IAuthPort {
    return {
      signInWithGoogle: jest.fn(),
      signInWithApple: jest.fn(),
      signInEmail: jest.fn().mockResolvedValue(mockSession),
      signOut: jest.fn(),
      getSession: jest.fn(),
      ...overrides,
    };
  }

  it("forwards the credential to the port and returns the session", async () => {
    const port = createMockPort();
    const uc = new SignInUseCase(port);
    const input = { email: "reviewer@example.com", password: "secret" };

    const result = await uc.execute(input);

    expect(port.signInEmail).toHaveBeenCalledWith(input);
    expect(result).toBe(mockSession);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      signInEmail: jest.fn().mockRejectedValue(new Error("Invalid credentials")),
    });
    const uc = new SignInUseCase(port);
    await expect(
      uc.execute({ email: "x@y.z", password: "bad" })
    ).rejects.toThrow("Invalid credentials");
  });
});
