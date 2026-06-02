import * as AppleAuthentication from "expo-apple-authentication";
import { getAppleCredential } from "../appleCredentialProvider";
import { SignInCancelled } from "@/domain/auth";

const signInAsyncMock = AppleAuthentication.signInAsync as jest.Mock;

describe("getAppleCredential", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the idToken, the generated nonce, and the joined name", async () => {
    signInAsyncMock.mockResolvedValue({
      identityToken: "apple-id-token",
      fullName: { givenName: "Ada", familyName: "Lovelace" },
    });

    const credential = await getAppleCredential();

    expect(credential).toEqual({
      idToken: "apple-id-token",
      nonce: "test-nonce-uuid",
      name: "Ada Lovelace",
    });
    // The same nonce must be handed to Apple for the token's nonce claim.
    expect(signInAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({ nonce: "test-nonce-uuid" })
    );
  });

  it("returns a null name when Apple omits it (subsequent sign-ins)", async () => {
    signInAsyncMock.mockResolvedValue({
      identityToken: "apple-id-token",
      fullName: null,
    });

    const credential = await getAppleCredential();
    expect(credential.name).toBeNull();
  });

  it("throws SignInCancelled when the user dismisses the sheet", async () => {
    signInAsyncMock.mockRejectedValue({ code: "ERR_REQUEST_CANCELED" });

    await expect(getAppleCredential()).rejects.toBeInstanceOf(SignInCancelled);
  });

  it("rethrows non-cancellation errors", async () => {
    signInAsyncMock.mockRejectedValue(new Error("network down"));

    await expect(getAppleCredential()).rejects.toThrow("network down");
  });

  it("throws when no identity token is returned", async () => {
    signInAsyncMock.mockResolvedValue({ identityToken: null, fullName: null });

    await expect(getAppleCredential()).rejects.toThrow(/identity token/i);
  });
});
