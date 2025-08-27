import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.yourco.kioskminigame",
  appName: "Kiosk Minigame",
  webDir: "out",
  server: { androidScheme: "https" }, // local, from assets
};

export default config;
