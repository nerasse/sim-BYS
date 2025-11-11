import { redirect } from "@remix-run/node";
import { getActivePresetId } from "~/db/queries/active-preset";

/**
 * Helper pour vérifier qu'un preset actif existe.
 * Redirige vers la page d'accueil si aucun preset n'est actif.
 */
export async function requireActivePreset() {
  const activePresetId = await getActivePresetId();
  
  if (!activePresetId) {
    throw redirect("/?error=no-preset", {
      headers: {
        "Set-Cookie": "flash-message=Veuillez sélectionner un preset; Path=/; HttpOnly; SameSite=Lax",
      },
    });
  }
  
  return activePresetId;
}

