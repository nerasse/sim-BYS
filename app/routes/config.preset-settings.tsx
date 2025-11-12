import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, Form } from "@remix-run/react";
import { requireActivePreset } from "~/lib/utils/require-active-preset";
import { getPresetById, updatePreset } from "~/db/queries/presets";
import { getAllObjectSelectionPresets } from "~/db/queries/object-selection-presets";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { ExternalLink } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const activePresetId = await requireActivePreset();
  const [preset, objectSelectionPresets] = await Promise.all([
    getPresetById(activePresetId),
    getAllObjectSelectionPresets(),
  ]);

  if (!preset) {
    throw new Response("Preset not found", { status: 404 });
  }

  return json({ preset, objectSelectionPresets });
}

export async function action({ request }: ActionFunctionArgs) {
  const activePresetId = await requireActivePreset();
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update-basic") {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    await updatePreset(activePresetId, {
      name,
      description,
    });

    return json({ success: true });
  }

  if (intent === "select-object-selection") {
    const objectSelectionPresetId = formData.get("objectSelectionPresetId") as string;

    await updatePreset(activePresetId, {
      objectSelectionPresetId: objectSelectionPresetId || null,
    });

    return json({ success: true });
  }

  return json({ success: false });
}

export default function ConfigPresetSettings() {
  const { preset, objectSelectionPresets } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleObjectSelectionChange = (objectSelectionPresetId: string | null) => {
    fetcher.submit(
      {
        intent: "select-object-selection",
        objectSelectionPresetId: objectSelectionPresetId || "",
      },
      { method: "post" }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres du Preset"
        description="Configuration générale et sélection du sous-preset d'objets"
      />

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
          <CardDescription>Nom et description du preset</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="update-basic" />
            
            <div className="space-y-2">
              <Label htmlFor="name">Nom du preset</Label>
              <Input
                id="name"
                name="name"
                defaultValue={preset.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                defaultValue={preset.description || ""}
              />
            </div>

            <Button type="submit">Sauvegarder</Button>
          </Form>
        </CardContent>
      </Card>

      {/* Object Selection Preset */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sous-preset d'Objets</CardTitle>
              <CardDescription>
                Sélectionner un sous-preset définissant quels bonus/jokers sont disponibles par niveau
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/resources/object-selections" target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                Gérer les sous-presets
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Option: Aucun sous-preset */}
            <div
              onClick={() => handleObjectSelectionChange(null)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                !preset.objectSelectionPresetId
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Aucun sous-preset</div>
                  <div className="text-sm text-muted-foreground">
                    Tous les objets sont disponibles par défaut
                  </div>
                </div>
                {!preset.objectSelectionPresetId && (
                  <Badge>Actif</Badge>
                )}
              </div>
            </div>

            {/* Liste des sous-presets */}
            {objectSelectionPresets.map((objPreset) => (
              <div
                key={objPreset.id}
                onClick={() => handleObjectSelectionChange(objPreset.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  preset.objectSelectionPresetId === objPreset.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{objPreset.name}</div>
                    {objPreset.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {objPreset.description}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {objPreset.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {preset.objectSelectionPresetId === objPreset.id && (
                    <Badge>Actif</Badge>
                  )}
                </div>
              </div>
            ))}

            {objectSelectionPresets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun sous-preset disponible</p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="/resources/object-selections" target="_blank">
                    Créer un sous-preset
                  </a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

