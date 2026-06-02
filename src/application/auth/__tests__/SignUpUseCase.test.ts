import { SignUpUseCase } from "../SignUpUseCase";
import type { IAuthPort } from "@/domain/auth/ports/IAuthPort";

describe("SignUpUseCase", () => {
  const mockResult = { userId: "new-user-1" };

  function createMockPort(overrides: Partial<IAuthPort> = {}): IAuthPort {
    return {
      signInEmail: jest.fn(),
      signUpEmail: jest.fn().mockResolvedValue(mockResult),
      signOut: jest.fn(),
      getSession: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.signUpEmail with input", async () => {
    const port = createMockPort();
    const uc = new SignUpUseCase(port);
    const input = { email: "new@example.com", password: "pass123", name: "New User" };
    const result = await uc.execute(input);

    expect(port.signUpEmail).toHaveBeenCalledWith(input);
    expect(result).toBe(mockResult);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new SignUpUseCase(port);
    const result = await uc.execute({
      email: "x@y.com",
      password: "abc",
      name: "X",
    });
    expect(result).toEqual({ userId: "new-user-1" });
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      signUpEmail: jest.fn().mockRejectedValue(new Error("Email taken")),
    });
    const uc = new SignUpUseCase(port);
    await expect(
      uc.execute({ email: "taken@example.com", password: "p", name: "T" })
    ).rejects.toThrow("Email taken");
  });
});
