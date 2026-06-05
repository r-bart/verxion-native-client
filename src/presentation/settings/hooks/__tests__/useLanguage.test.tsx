import { act } from "@testing-library/react-native";
import { renderHookWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { useLanguage } from "../useLanguage";

// `mock`-prefixed so jest's hoisted factory may reference them.
const mockChangeLanguage = jest.fn();
let mockLang = "en";
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n: { language: mockLang, changeLanguage: mockChangeLanguage } }),
}));

describe("useLanguage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLang = "en";
  });

  it("reflects the active language, normalizing a region code", () => {
    mockLang = "es-ES";
    const { result } = renderHookWithProviders(() => useLanguage());
    expect(result.current.language).toBe("es");
  });

  it("defaults to 'en' for an unsupported device language", () => {
    mockLang = "fr-FR";
    const { result } = renderHookWithProviders(() => useLanguage());
    expect(result.current.language).toBe("en");
  });

  it("changes i18n and persists the choice via the DI service", () => {
    const setStoredLanguage = jest.fn().mockResolvedValue(undefined);
    const container = createMockContainer({ languagePreference: { setStoredLanguage } });
    const { result } = renderHookWithProviders(() => useLanguage(), { container });

    act(() => result.current.setLanguage("es"));

    expect(mockChangeLanguage).toHaveBeenCalledWith("es");
    expect(setStoredLanguage).toHaveBeenCalledWith("es");
  });

  it("is a no-op when selecting the already-active language", () => {
    const setStoredLanguage = jest.fn();
    const container = createMockContainer({ languagePreference: { setStoredLanguage } });
    const { result } = renderHookWithProviders(() => useLanguage(), { container });

    act(() => result.current.setLanguage("en"));

    expect(mockChangeLanguage).not.toHaveBeenCalled();
    expect(setStoredLanguage).not.toHaveBeenCalled();
  });
});
