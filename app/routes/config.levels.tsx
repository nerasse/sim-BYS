import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { getAllLevelConfigs, updateLevelConfig } from "~/db/queries/level-configs";
import { configCache } from "~/lib/utils/config-cache";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/layout/page-header";
import { Info } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const levels = await getAllLevelConfigs();
  return json({ levels });
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const levelId = formData.get("levelId") as string;
  const baseObjective = parseInt(formData.get("baseObjective") as string);
  const dollarReward = parseInt(formData.get("dollarReward") as string);

  if (levelId && !isNaN(baseObjective) && !isNaN(dollarReward)) {
    await updateLevelConfig(levelId, { baseObjective, dollarReward });
    await configCache.updateLevelConfig(levelId);
  }

  return json({ success: true });
}

export default function ConfigLevelsPage() {
  const { levels } = useLoaderData<typeof loader>();

  // Group by world
  const levelsByWorld = levels.reduce((acc, level) => {
    if (!acc[level.world]) acc[level.world] = [];
    acc[level.world].push(level);
    return acc;
  }, {} as Record<number, typeof levels>);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuration des Niveaux"
        description="Gérer les objectifs de jetons et récompenses en dollars pour chaque niveau"
      />

      {Object.entries(levelsByWorld).map(([world, worldLevels]) => (
        <Card key={world}>
          <CardHeader>
            <CardTitle>Monde {world}</CardTitle>
            <CardDescription>
              {worldLevels.length} niveaux
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {worldLevels.map((level) => (
                <div
                  key={level.id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{level.levelId}</span>
                    {level.isBoss && (
                      <Badge variant="destructive">Boss</Badge>
                    )}
                  </div>
                  <Form method="post" className="col-span-3 flex gap-4">
                    <input type="hidden" name="levelId" value={level.levelId} />
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground">
                        Objectif (jetons)
                      </label>
                      <Input
                        type="number"
                        name="baseObjective"
                        defaultValue={level.baseObjective}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground">
                        Récompense ($)
                      </label>
                      <Input
                        type="number"
                        name="dollarReward"
                        defaultValue={level.dollarReward}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" size="sm">
                        Sauvegarder
                      </Button>
                    </div>
                  </Form>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Objectif (jetons)</strong> : Nombre de jetons requis pour compléter le niveau en Ascension 0.
          </p>
          <p>
            <strong>Récompense ($)</strong> : Nombre de dollars gagnés en complétant le niveau (avant intérêts).
          </p>
          <p>
            <strong>Ascension</strong> : Les objectifs sont multipliés par (1 + ascension × 0.15) automatiquement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

