import { SignInUseCase } from "../SignInUseCase";
import type { IAuthPort } from "@/domain/auth/ports/IAuthPort";
import type { SessionData } from "@/domain/auth/models/AuthUser";

describe("SignInUseCase", () => {
  const mockSession: SessionData = {
    user: {
      id: "user-1",
      email: "test@example.com",
      name: "Test",
      image: null,
      emailVerified: true,
    },
    session: { token: "tok-abc", userId: "user-1", expiresAt: new Date("2026-12-31") },
  };

  function createMockPort(overrides: Partial<IAuthPort> = {}): IAuthPort {
    return {
      signInEmail: jest.fn().mockResolvedValue(mockSession),
      signUpEmail: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.signInEmail with credentials", async () => {
    const port = createMockPort();
    const uc = new SignInUseCase(port);
    const result = await uc.execute({ email: "test@example.com", password: "pass123" });

    expect(port.signInEmail).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "pass123",
    });
    expect(result).toBe(mockSession);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new SignInUseCase(port);
    const result = await uc.execute({ email: "a@b.com", password: "x" });
    expect(result).toEqual(mockSession);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      signInEmail: jest.fn().mockRejectedValue(new Error("Invalid credentials")),
    });
    const uc = new SignInUseCase(port);
    await expect(uc.execute({ email: "a@b.com", password: "wrong" })).rejects.toThrow(
      "Invalid credentials"
    );
  });
});
