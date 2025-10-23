import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { setActivePreset } from "~/db/queries/active-preset";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const presetId = formData.get("presetId");

  if (typeof presetId !== "string") {
    return json({ error: "Invalid preset ID" }, { status: 400 });
  }

  try {
    await setActivePreset(presetId);

    // Rediriger vers la page précédente ou /config
    const referer = request.headers.get("referer");
    return redirect(referer || "/config");
  } catch (error) {
    console.error("Error setting active preset:", error);
    return json(
      { error: "Failed to set active preset" },
      { status: 500 }
    );
  }
}

