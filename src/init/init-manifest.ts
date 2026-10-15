import { initializeManifest } from "#app/global-manifest";
import { bypassLogin } from "#constants/app-constants";

// Standalone builds serve their assets locally and do not need the server's cache manifest.
if (!bypassLogin) {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}manifest.json`);
    if (response.ok) {
      const manifest = await response.json();
      initializeManifest(manifest["manifest"]);
    }
  } catch (err) {
    // This optional cache manifest must not prevent the game from starting.
    console.log("Manifest not found:", err);
  }
}
