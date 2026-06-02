import { SignOutUseCase } from "../SignOutUseCase";
import type { IAuthPort } from "@/domain/auth/ports/IAuthPort";

describe("SignOutUseCase", () => {
  function createMockPort(overrides: Partial<IAuthPort> = {}): IAuthPort {
    return {
      signInWithGoogle: jest.fn(),
      signInWithApple: jest.fn(),
      signInEmail: jest.fn(),
      signOut: jest.fn().mockResolvedValue(undefined),
      getSession: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.signOut", async () => {
    const port = createMockPort();
    const uc = new SignOutUseCase(port);
    await uc.execute();

    expect(port.signOut).toHaveBeenCalledTimes(1);
  });

  it("returns void", async () => {
    const port = createMockPort();
    const uc = new SignOutUseCase(port);
    const result = await uc.execute();
    expect(result).toBeUndefined();
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      signOut: jest.fn().mockRejectedValue(new Error("Network error")),
    });
    const uc = new SignOutUseCase(port);
    await expect(uc.execute()).rejects.toThrow("Network error");
  });
});
