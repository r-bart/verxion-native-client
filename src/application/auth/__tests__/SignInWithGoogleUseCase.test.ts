import { SignInWithGoogleUseCase } from "../SignInWithGoogleUseCase";
import type { IAuthPort } from "@/domain/auth/ports/IAuthPort";

describe("SignInWithGoogleUseCase", () => {
  function createMockPort(overrides: Partial<IAuthPort> = {}): IAuthPort {
    return {
      signInWithGoogle: jest.fn().mockResolvedValue(undefined),
      signInWithApple: jest.fn(),
      signInEmail: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.signInWithGoogle", async () => {
    const port = createMockPort();
    const uc = new SignInWithGoogleUseCase(port);
    await uc.execute();
    expect(port.signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      signInWithGoogle: jest.fn().mockRejectedValue(new Error("oauth failed")),
    });
    const uc = new SignInWithGoogleUseCase(port);
    await expect(uc.execute()).rejects.toThrow("oauth failed");
  });
});
