import type { AuthUser, AuthSession, SessionData } from "../models/AuthUser";

describe("Auth Domain Models", () => {
  it("AuthUser has required fields", () => {
    const user: AuthUser = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      image: null,
      emailVerified: true,
    };
    expect(user.id).toBe("user-1");
    expect(user.email).toBe("test@example.com");
    expect(user.name).toBe("Test User");
    expect(user.image).toBeNull();
    expect(user.emailVerified).toBe(true);
  });

  it("AuthUser accepts image URL", () => {
    const user: AuthUser = {
      id: "user-2",
      email: "avatar@example.com",
      name: "Avatar User",
      image: "https://cdn.example.com/avatar.png",
      emailVerified: false,
    };
    expect(user.image).toBe("https://cdn.example.com/avatar.png");
    expect(user.emailVerified).toBe(false);
  });

  it("AuthSession has token, userId, expiresAt", () => {
    const expiresAt = new Date("2026-12-31T23:59:59Z");
    const session: AuthSession = {
      token: "session-token-abc",
      userId: "user-1",
      expiresAt,
    };
    expect(session.token).toBe("session-token-abc");
    expect(session.userId).toBe("user-1");
    expect(session.expiresAt).toEqual(expiresAt);
  });

  it("SessionData combines user and session", () => {
    const data: SessionData = {
      user: {
        id: "user-1",
        email: "a@b.com",
        name: "A",
        image: null,
        emailVerified: false,
      },
      session: {
        token: "tok-123",
        userId: "user-1",
        expiresAt: new Date("2026-06-01"),
      },
    };
    expect(data.user.id).toBe(data.session.userId);
    expect(data.session.token).toBe("tok-123");
  });
});
