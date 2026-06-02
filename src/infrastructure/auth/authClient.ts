import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const scheme = (Constants.expoConfig?.scheme as string) ?? "verxion";

export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    headers: {
      Origin: `${scheme}://`,
    },
  },
  plugins: [
    expoClient({
      scheme,
      storagePrefix: "verxion",
      storage: SecureStore,
    }),
  ],
});
