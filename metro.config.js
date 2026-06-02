const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const nodeModules = [
    "ws",
    "stream",
    "crypto",
    "fs",
    "path",
    "os",
    "net",
    "tls",
    "http",
    "https",
    "zlib",
  ];

  if (nodeModules.includes(moduleName)) {
    return {
      filePath: path.resolve(__dirname, "src/polyfills/empty-module.js"),
      type: "sourceFile",
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.alias = {
  "@/domain": path.resolve(__dirname, "src/domain"),
  "@/application": path.resolve(__dirname, "src/application"),
  "@/infrastructure": path.resolve(__dirname, "src/infrastructure"),
  "@/presentation": path.resolve(__dirname, "src/presentation"),
};

module.exports = withNativeWind(config, {
  input: "./src/presentation/_shared/styles/global.css",
});
