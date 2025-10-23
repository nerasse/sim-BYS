import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllPresets } from "~/db/queries/presets";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export const meta: MetaFunction = () => {
  return [
    { title: "Presets - Simulateur BYS" },
    { name: "description", content: "Gestion des configurations sauvegardées" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const presets = await getAllPresets();
  return json({ presets });
}

export default function Presets() {
  const { presets } = useLoaderData<typeof loader>();

  return (
    <div>
      <PageHeader
        title="💾 Presets"
        description="Gestion des configurations sauvegardées"
        actions={
          <Button>
            <span className="mr-2">➕</span>
            Nouveau Preset
          </Button>
        }
      />

      {presets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-12">
              <div className="text-6xl mb-4">💾</div>
              <p className="mb-4">Aucun preset sauvegardé</p>
              <Button>Créer votre premier preset</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <Card key={preset.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{preset.name}</CardTitle>
                  {preset.isFavorite && <Badge variant="default">⭐ Favori</Badge>}
                </div>
                <CardDescription>{preset.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {preset.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ascension:</span>
                      <span className="font-medium">{preset.ascension}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Niveaux:</span>
                      <span className="font-medium">
                        {preset.simulationParams.startLevel} →{" "}
                        {preset.simulationParams.endLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode:</span>
                      <span className="font-medium capitalize">
                        {preset.simulationParams.mode}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Button size="sm" className="flex-1">
                      Charger
                    </Button>
                    <Button size="sm" variant="outline">
                      ✏️
                    </Button>
                    <Button size="sm" variant="outline">
                      🗑️
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

