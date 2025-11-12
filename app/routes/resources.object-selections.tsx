import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { 
  getAllObjectSelectionPresets,
  createObjectSelectionPreset,
  deleteObjectSelectionPreset,
  duplicateObjectSelectionPreset
} from "~/db/queries/object-selection-presets";
import { 
  copyObjectSelectionBonuses 
} from "~/db/queries/object-selection-bonuses";
import { 
  copyObjectSelectionJokers 
} from "~/db/queries/object-selection-jokers";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus, Copy, Trash2, Settings } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Sélections d'Objets - Ressources - Simulateur BYS" },
    { name: "description", content: "Gérer les sous-presets de disponibilité d'objets par niveau" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const objectSelectionPresets = await getAllObjectSelectionPresets();
  return json({ objectSelectionPresets });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    
    await createObjectSelectionPreset({
      name: name || "Nouveau sous-preset",
      description: description || "",
      tags: [],
    });

    return redirect("/resources/object-selections");
  }

  if (intent === "delete") {
    const id = formData.get("id") as string;
    await deleteObjectSelectionPreset(id);
    return json({ success: true });
  }

  if (intent === "duplicate") {
    const id = formData.get("id") as string;
    const newPreset = await duplicateObjectSelectionPreset(id);
    
    // Copy availabilities
    await copyObjectSelectionBonuses(id, newPreset!.id);
    await copyObjectSelectionJokers(id, newPreset!.id);
    
    return json({ success: true });
  }

  return json({ success: false });
}

export default function ResourcesObjectSelections() {
  const { objectSelectionPresets } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleCreate = () => {
    const name = prompt("Nom du sous-preset :");
    if (!name) return;

    fetcher.submit(
      { intent: "create", name },
      { method: "post" }
    );
  };

  const handleDuplicate = (id: string) => {
    fetcher.submit(
      { intent: "duplicate", id },
      { method: "post" }
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Supprimer le sous-preset "${name}" ?`)) return;

    fetcher.submit(
      { intent: "delete", id },
      { method: "post" }
    );
  };

  return (
    <div>
      <PageHeader
        title="Sélections d'Objets"
        description="Sous-presets réutilisables définissant la disponibilité des bonus et jokers par niveau"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau sous-preset
          </Button>
        }
      />

      {objectSelectionPresets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-12">
              <p>Aucun sous-preset d'objets</p>
              <Button className="mt-4" onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier sous-preset
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {objectSelectionPresets.map((preset) => (
            <Card key={preset.id}>
              <CardHeader>
                <CardTitle className="text-lg">{preset.name}</CardTitle>
                {preset.description && (
                  <CardDescription>{preset.description}</CardDescription>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {preset.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/resources/object-selections/${preset.id}`}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configurer
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(preset.id)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(preset.id, preset.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

