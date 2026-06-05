import * as SecureStore from "expo-secure-store";
import { getStoredLanguage, setStoredLanguage } from "../languagePreference";

jest.mock("expo-secure-store", () => ({
  __esModule: true,
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const getItem = SecureStore.getItemAsync as jest.Mock;
const setItem = SecureStore.setItemAsync as jest.Mock;

beforeEach(() => {
  getItem.mockReset();
  setItem.mockReset();
});

describe("getStoredLanguage", () => {
  it("returns a supported stored language", async () => {
    getItem.mockResolvedValue("es");
    await expect(getStoredLanguage()).resolves.toBe("es");
    expect(getItem).toHaveBeenCalledWith("appLanguage");
  });

  it("returns null when nothing is stored", async () => {
    getItem.mockResolvedValue(null);
    await expect(getStoredLanguage()).resolves.toBeNull();
  });

  it("returns null for an unsupported stored value", async () => {
    getItem.mockResolvedValue("fr");
    await expect(getStoredLanguage()).resolves.toBeNull();
  });

  it("returns null when the read throws (best-effort)", async () => {
    getItem.mockRejectedValue(new Error("keychain unavailable"));
    await expect(getStoredLanguage()).resolves.toBeNull();
  });
});

describe("setStoredLanguage", () => {
  it("persists the language under the storage key", async () => {
    setItem.mockResolvedValue(undefined);
    await setStoredLanguage("en");
    expect(setItem).toHaveBeenCalledWith("appLanguage", "en");
  });

  it("swallows write errors (best-effort)", async () => {
    setItem.mockRejectedValue(new Error("disk full"));
    await expect(setStoredLanguage("es")).resolves.toBeUndefined();
  });
});
