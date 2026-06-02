module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|native-base|react-native-svg|nativewind|@tanstack/.*|better-auth|@better-auth/.*|lucide-react-native|react-native-reanimated|react-native-css-interop|clsx|tailwind-merge)",
  ],
  setupFilesAfterEnv: [
    "./jest.setup.js",
    "@testing-library/jest-native/extend-expect",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@/application/(.*)$": "<rootDir>/src/application/$1",
    "^@/infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@/presentation/(.*)$": "<rootDir>/src/presentation/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
  collectCoverageFrom: [
    "src/domain/**/*.ts",
    "src/application/**/*.ts",
    "src/infrastructure/repositories/**/*.ts",
    "src/infrastructure/api/**/*.ts",
    "src/presentation/**/hooks/**/*.ts",
    "!**/*.d.ts",
    "!**/index.ts",
  ],
};
