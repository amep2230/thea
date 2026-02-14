import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import "./index.css";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  console.error("VITE_CONVEX_URL is not defined");
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        <h1 className="text-xl font-bold">Configuration Error</h1>
        <p>The VITE_CONVEX_URL environment variable is missing.</p>
        <p>Please check your deployment settings.</p>
      </div>
    </div>
  );
} else {
  const convex = new ConvexReactClient(convexUrl as string);

  createRoot(document.getElementById("root")!).render(
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>,
  );
}
