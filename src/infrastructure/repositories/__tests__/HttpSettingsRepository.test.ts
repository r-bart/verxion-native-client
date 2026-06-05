import { HttpSettingsRepository } from "../HttpSettingsRepository";
import { apiClient, ApiError } from "../../api/apiClient";

// Stub apiClient (and a minimal ApiError so `instanceof` works in getProfile's
// 404 branch) without loading the real module's `expo-constants` import.
jest.mock("../../api/apiClient", () => {
  class ApiError extends Error {
    status: number;
    code?: string;
    constructor(message: string, status: number, code?: string) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.code = code;
    }
  }
  return {
    ApiError,
    apiClient: {
      get: jest.fn(),
      post: jest.fn(),
      postForm: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      del: jest.fn(),
    },
  };
});

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
const mockPut = apiClient.put as jest.MockedFunction<typeof apiClient.put>;
const mockPostForm = apiClient.postForm as jest.MockedFunction<typeof apiClient.postForm>;

const RAW_PROFILE = {
  username: "reviewer1",
  displayName: "Roberto",
  bio: null,
  avatarUrl: "https://blob/avatar.png",
  sportTags: [],
  isPublic: true,
  followerCount: 0,
  followingCount: 0,
  usernameChangedAt: null,
  sectionVisibility: { bio: false, training: true, bodyMetrics: false, nutrition: true },
  showcaseMetrics: ["total_volume"],
  timelineDetailLevel: "detailed",
  requireFollowApproval: true,
};

describe("HttpSettingsRepository", () => {
  let repo: HttpSettingsRepository;

  beforeEach(() => {
    repo = new HttpSettingsRepository();
    jest.clearAllMocks();
  });

  describe("getAccount", () => {
    it("maps the raw user profile to the domain account (renames + nested fields)", async () => {
      // apiClient already unwraps `{ data }`, so the mock returns the inner shape.
      mockGet.mockResolvedValue({
        id: "user-1",
        email: "r@example.com",
        name: "Roberto",
        username: "reviewer1",
        gender: "male", // API field is `sex` on write, `gender` on read
        dateOfBirth: "1990-01-01",
        heightCm: 180,
        measurementSystem: "imperial",
        experienceLevel: "advanced",
        fitnessGoals: { primary: "strength" },
        preferences: { theme: "dark", accent: "red", language: "es" },
        currentHealthConsentVersion: "2",
      });

      const account = await repo.getAccount();

      expect(mockGet).toHaveBeenCalledWith("/users/me");
      expect(account).toEqual({
        id: "user-1",
        email: "r@example.com",
        name: "Roberto",
        username: "reviewer1",
        gender: "male",
        dateOfBirth: "1990-01-01",
        heightCm: 180,
        measurementSystem: "imperial",
        experienceLevel: "advanced",
        primaryGoal: "strength", // from fitnessGoals.primary
        language: "es", // from preferences.language
        currentHealthConsentVersion: "2",
      });
    });

    it("applies safe defaults when optional fields are absent", async () => {
      mockGet.mockResolvedValue({ id: "u", currentHealthConsentVersion: "1" });

      const account = await repo.getAccount();

      expect(account.email).toBe("");
      expect(account.measurementSystem).toBe("metric");
      expect(account.experienceLevel).toBe("beginner");
      expect(account.primaryGoal).toBeNull();
      expect(account.language).toBeNull();
    });
  });

  describe("getProfile", () => {
    it("maps a 200 response to the domain profile", async () => {
      mockGet.mockResolvedValue({
        username: "reviewer1",
        displayName: "Roberto",
        bio: null,
        avatarUrl: null,
        sportTags: ["powerlifting"],
        isPublic: false,
        followerCount: 0,
        followingCount: 0,
        usernameChangedAt: null,
      });

      const profile = await repo.getProfile();

      expect(mockGet).toHaveBeenCalledWith("/profiles/me");
      expect(profile?.username).toBe("reviewer1");
      expect(profile?.sportTags).toEqual(["powerlifting"]);
    });

    it("returns null when the profile does not exist (404, not 204)", async () => {
      mockGet.mockRejectedValue(new ApiError("not found", 404));

      await expect(repo.getProfile()).resolves.toBeNull();
    });

    it("rethrows non-404 errors", async () => {
      mockGet.mockRejectedValue(new ApiError("server error", 500));

      await expect(repo.getProfile()).rejects.toThrow("server error");
    });
  });

  describe("updateAccount", () => {
    it("unwraps the { user } envelope and maps it back to a domain account", async () => {
      mockPut.mockResolvedValue({
        user: {
          id: "user-1",
          email: "r@example.com",
          name: "Roberto",
          username: "reviewer1",
          gender: "male",
          dateOfBirth: null,
          heightCm: null,
          measurementSystem: "metric",
          experienceLevel: "beginner",
          fitnessGoals: { primary: null },
          currentHealthConsentVersion: "1",
        },
      });

      const account = await repo.updateAccount({ heightCm: 175 });

      expect(mockPut).toHaveBeenCalledWith("/users/me", { heightCm: 175 });
      expect(account.id).toBe("user-1");
      expect(account.primaryGoal).toBeNull();
    });
  });

  describe("getProfile (privacy fields)", () => {
    it("maps the privacy surface from the response", async () => {
      mockGet.mockResolvedValue(RAW_PROFILE);
      const profile = await repo.getProfile();
      expect(profile?.sectionVisibility).toEqual({
        bio: false,
        training: true,
        bodyMetrics: false,
        nutrition: true,
      });
      expect(profile?.showcaseMetrics).toEqual(["total_volume"]);
      expect(profile?.timelineDetailLevel).toBe("detailed");
      expect(profile?.requireFollowApproval).toBe(true);
    });

    it("defaults the privacy surface when the server omits it", async () => {
      const { sectionVisibility, showcaseMetrics, timelineDetailLevel, requireFollowApproval, ...rest } =
        RAW_PROFILE;
      void sectionVisibility;
      void showcaseMetrics;
      void timelineDetailLevel;
      void requireFollowApproval;
      mockGet.mockResolvedValue(rest);
      const profile = await repo.getProfile();
      expect(profile?.sectionVisibility).toEqual({
        bio: true,
        training: true,
        bodyMetrics: true,
        nutrition: true,
      });
      expect(profile?.showcaseMetrics).toEqual([]);
      expect(profile?.timelineDetailLevel).toBe("summary");
      expect(profile?.requireFollowApproval).toBe(false);
    });
  });

  describe("avatar", () => {
    it("uploads a multipart file and maps the returned profile", async () => {
      mockPostForm.mockResolvedValue({ avatarUrl: "https://blob/avatar.png", profile: RAW_PROFILE });
      const profile = await repo.uploadAvatar({ uri: "file://x.jpg", name: "x.jpg", type: "image/jpeg" });
      expect(mockPostForm).toHaveBeenCalledWith("/profiles/me/avatar", expect.any(FormData));
      expect(profile.avatarUrl).toBe("https://blob/avatar.png");
    });
  });

  describe("privacy writes", () => {
    it("sends visibility verbatim", async () => {
      mockPut.mockResolvedValue({});
      const v = { bio: false, training: true, bodyMetrics: true, nutrition: false };
      await repo.updateVisibility(v);
      expect(mockPut).toHaveBeenCalledWith("/profiles/me/visibility", v);
    });

    it("wraps showcase metrics in { metrics }", async () => {
      mockPut.mockResolvedValue({});
      await repo.updateShowcase(["total_volume", "current_streak"]);
      expect(mockPut).toHaveBeenCalledWith("/profiles/me/showcase", {
        metrics: ["total_volume", "current_streak"],
      });
    });

    it("wraps feed sharing in { feedSharingSettings }", async () => {
      mockPut.mockResolvedValue({});
      const fs = { training: true, nutrition: false, bodyMetrics: true };
      await repo.updateFeedSharing(fs);
      expect(mockPut).toHaveBeenCalledWith("/profiles/me/feed-sharing", { feedSharingSettings: fs });
    });

    it("reads feed sharing from its own endpoint", async () => {
      mockGet.mockResolvedValue({ training: true, nutrition: false, bodyMetrics: false });
      const fs = await repo.getFeedSharing();
      expect(mockGet).toHaveBeenCalledWith("/profiles/me/feed-sharing");
      expect(fs.training).toBe(true);
    });
  });
});
