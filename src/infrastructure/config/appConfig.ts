/**
 * App build metadata, surfaced via the DI container (`appInfo`) so presentation
 * reads it through `useDI` rather than importing the native `expo-constants`
 * module directly — consistent with the cross-cutting-via-DI convention.
 */
import Constants from "expo-constants";

export const appVersion: string = Constants.expoConfig?.version ?? "1.0.0";
