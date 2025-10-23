import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { getActivePresetId } from "~/db/queries/active-preset";
import { getPresetLevelConfigs, upsertPresetLevelConfig } from "~/db/queries/preset-level-configs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/layout/page-header";

export async function loader({ request }: LoaderFunctionArgs) {
  const activePresetId = await getActivePresetId();
  
  if (!activePresetId) {
    throw new Response("No active preset", { status: 404 });
  }

  const levels = await getPresetLevelConfigs(activePresetId);
  
  return json({ levels });
}

export async function action({ request }: LoaderFunctionArgs) {
  const activePresetId = await getActivePresetId();
  
  if (!activePresetId) {
    return json({ error: "No active preset" }, { status: 404 });
  }

  const formData = await request.formData();
  const levelId = formData.get("levelId") as string;
  const world = parseInt(formData.get("world") as string);
  const stage = parseInt(formData.get("stage") as string);
  const baseObjective = parseInt(formData.get("baseObjective") as string);
  const dollarReward = parseInt(formData.get("dollarReward") as string);
  const isBoss = formData.get("isBoss") === "true";

  if (levelId && !isNaN(world) && !isNaN(stage) && !isNaN(baseObjective) && !isNaN(dollarReward)) {
    await upsertPresetLevelConfig(activePresetId, levelId, {
      world,
      stage,
      baseObjective,
      dollarReward,
      isBoss,
    });
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
        description="Gérer les objectifs de jetons et récompenses en dollars du preset actif"
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
                    <input type="hidden" name="world" value={level.world} />
                    <input type="hidden" name="stage" value={level.stage} />
                    <input type="hidden" name="isBoss" value={level.isBoss ? "true" : "false"} />
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
    </div>
  );
}
