import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Change "wedding-invite" to your GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: "/wedding-invite/",
});
