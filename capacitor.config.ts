import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.srimanjunatha.billing",
  appName: "Sri Manjunatha Engineering Works",
  webDir: "out",
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f172a",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK" as any,
      backgroundColor: "#0f172a",
    },
  },
  ios: {
    contentInset: "always",
    scheme: "Sri Manjunatha",
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#0f172a",
  },
};

export default config;
