import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["dotenv/config"], //this line,
    exclude: [...configDefaults.exclude, "*/e2e/*"],
    env: {
      CONTENT_PREFIX: "mixologist_",
      NEXT_PUBLIC_CONFIG_DOC: "Config",
      NEXT_PUBLIC_EVENTS_MAP: "Events",
    },
  },
});