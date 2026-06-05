// Native auth modules — stubbed so auth screens/hooks mount and the Apple
// credential flow can be driven from tests.
jest.mock("expo-apple-authentication", () => {
  const React = require("react");
  const { Pressable } = require("react-native");
  return {
    __esModule: true,
    AppleAuthenticationButton: ({ onPress }) =>
      React.createElement(Pressable, {
        testID: "apple-signin-button",
        onPress,
      }),
    AppleAuthenticationButtonType: { SIGN_IN: 0, CONTINUE: 1, SIGN_UP: 2 },
    AppleAuthenticationButtonStyle: { WHITE: 0, WHITE_OUTLINE: 1, BLACK: 2 },
    AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
    signInAsync: jest.fn(),
    isAvailableAsync: jest.fn().mockResolvedValue(true),
  };
});

jest.mock("expo-crypto", () => ({
  __esModule: true,
  randomUUID: jest.fn(() => "test-nonce-uuid"),
}));

// Image picker — native module; stub the library launcher (default: canceled).
jest.mock("expo-image-picker", () => ({
  __esModule: true,
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  requestMediaLibraryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ granted: true, status: "granted" }),
  MediaTypeOptions: { Images: "Images", Videos: "Videos", All: "All" },
}));

// Liquid Glass (iOS 26+) — unavailable in the test env; render the translucent
// fallback path. GlassView passes through as a plain View.
jest.mock("expo-glass-effect", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    GlassView: ({ children, style }) => React.createElement(View, { style }, children),
    isLiquidGlassAvailable: () => false,
  };
});

// Mock react-native-worklets before reanimated tries to load it
jest.mock("react-native-worklets", () => ({
  createRunOnJS: jest.fn(),
  createWorkletRuntime: jest.fn(),
  defaultRuntime: {},
}));

// Mock @shopify/react-native-skia (only WeeklyRingsCard uses it). The official
// mock builds Skia via JsiSkApi(global.CanvasKit), which requires loading the
// CanvasKit WASM — too heavy for unit tests. A lightweight stub with a
// chainable Path is enough: charts render as no-op Views, and the surrounding
// cards/text still mount.
jest.mock("@shopify/react-native-skia", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Noop = () => null;
  const makePath = () => {
    const path = {};
    for (const m of [
      "addCircle", "addArc", "addRect", "addRRect", "addOval", "moveTo",
      "lineTo", "cubicTo", "quadTo", "arcToOval", "close", "reset", "rewind",
      "offset", "transform", "trim", "stroke", "simplify", "op", "copy",
    ]) {
      path[m] = () => path;
    }
    return path;
  };
  const Skia = {
    Path: { Make: makePath, MakeFromSVGString: makePath },
    Point: (x, y) => ({ x, y }),
    XYWHRect: (x, y, width, height) => ({ x, y, width, height }),
    Color: () => 0,
  };
  return {
    __esModule: true,
    Skia,
    Canvas: ({ children }) => React.createElement(View, null, children),
    Path: Noop,
    Circle: Noop,
    Group: Noop,
    Rect: Noop,
    RoundedRect: Noop,
    Line: Noop,
    Fill: Noop,
    vec: (x, y) => ({ x, y }),
    useFont: () => null,
    matchFont: () => null,
    useFonts: () => null,
  };
});

// Now we can safely mock reanimated
jest.mock("react-native-reanimated", () => {
  const View = require("react-native").View;
  return {
    __esModule: true,
    default: {
      View,
      Text: require("react-native").Text,
      Image: require("react-native").Image,
      ScrollView: require("react-native").ScrollView,
      FlatList: require("react-native").FlatList,
      createAnimatedComponent: (component) => component,
    },
    useSharedValue: jest.fn((init) => ({ value: init })),
    useAnimatedStyle: jest.fn((fn) => fn()),
    useDerivedValue: jest.fn((fn) => ({ value: fn() })),
    withSpring: jest.fn((val) => val),
    withTiming: jest.fn((val) => val),
    withRepeat: jest.fn((val) => val),
    withSequence: jest.fn((...vals) => vals[0]),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      bezier: jest.fn(() => jest.fn()),
    },
    useAnimatedRef: jest.fn(() => ({ current: null })),
    useAnimatedScrollHandler: jest.fn(),
    FadeIn: { duration: jest.fn().mockReturnThis() },
    FadeOut: { duration: jest.fn().mockReturnThis() },
    Layout: { duration: jest.fn().mockReturnThis() },
    SlideInRight: { duration: jest.fn().mockReturnThis() },
    SlideOutLeft: { duration: jest.fn().mockReturnThis() },
  };
});
