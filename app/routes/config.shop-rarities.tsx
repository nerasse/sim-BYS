import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { requireActivePreset } from "~/lib/utils/require-active-preset";
import { getPresetShopRarityConfigs, upsertPresetShopRarityConfig } from "~/db/queries/preset-shop-rarity-configs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/layout/page-header";
import { Progress } from "~/components/ui/progress";

export async function loader({ request }: LoaderFunctionArgs) {
  const activePresetId = await requireActivePreset();
  const configs = await getPresetShopRarityConfigs(activePresetId);
  
  return json({ configs });
}

export async function action({ request }: LoaderFunctionArgs) {
  const activePresetId = await requireActivePreset();
  const formData = await request.formData();
  const world = parseInt(formData.get("world") as string);
  const commonWeight = parseFloat(formData.get("commonWeight") as string);
  const uncommonWeight = parseFloat(formData.get("uncommonWeight") as string);
  const rareWeight = parseFloat(formData.get("rareWeight") as string);
  const epicWeight = parseFloat(formData.get("epicWeight") as string);
  const legendaryWeight = parseFloat(formData.get("legendaryWeight") as string);

  if (!isNaN(world)) {
    await upsertPresetShopRarityConfig(activePresetId, world, {
      commonWeight,
      uncommonWeight,
      rareWeight,
      epicWeight,
      legendaryWeight,
    });
  }

  return json({ success: true });
}

export default function ConfigShopRaritiesPage() {
  const { configs } = useLoaderData<typeof loader>();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-500";
      case "uncommon": return "bg-green-500";
      case "rare": return "bg-blue-500";
      case "epic": return "bg-purple-500";
      case "legendary": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuration Raretés Boutique"
        description="Gérer les probabilités d'apparition des raretés de jokers du preset actif"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configs.map((config) => {
          const total = 
            config.commonWeight +
            config.uncommonWeight +
            config.rareWeight +
            config.epicWeight +
            config.legendaryWeight;

          return (
            <Card key={config.id}>
              <CardHeader>
                <CardTitle>Monde {config.world}</CardTitle>
                <CardDescription>
                  Poids total : {total.toFixed(1)}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="world" value={config.world} />
                  
                  <div>
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span>Commun</span>
                      <span className="text-muted-foreground">
                        {((config.commonWeight / total) * 100).toFixed(1)}%
                      </span>
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      name="commonWeight"
                      defaultValue={config.commonWeight}
                      className="mt-1"
                    />
                    <Progress 
                      value={(config.commonWeight / total) * 100} 
                      className={`mt-2 ${getRarityColor("common")}`}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span>Peu commun</span>
                      <span className="text-muted-foreground">
                        {((config.uncommonWeight / total) * 100).toFixed(1)}%
                      </span>
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      name="uncommonWeight"
                      defaultValue={config.uncommonWeight}
                      className="mt-1"
                    />
                    <Progress 
                      value={(config.uncommonWeight / total) * 100} 
                      className={`mt-2 ${getRarityColor("uncommon")}`}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span>Rare</span>
                      <span className="text-muted-foreground">
                        {((config.rareWeight / total) * 100).toFixed(1)}%
                      </span>
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      name="rareWeight"
                      defaultValue={config.rareWeight}
                      className="mt-1"
                    />
                    <Progress 
                      value={(config.rareWeight / total) * 100} 
                      className={`mt-2 ${getRarityColor("rare")}`}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span>Épique</span>
                      <span className="text-muted-foreground">
                        {((config.epicWeight / total) * 100).toFixed(1)}%
                      </span>
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      name="epicWeight"
                      defaultValue={config.epicWeight}
                      className="mt-1"
                    />
                    <Progress 
                      value={(config.epicWeight / total) * 100} 
                      className={`mt-2 ${getRarityColor("epic")}`}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span>Légendaire</span>
                      <span className="text-muted-foreground">
                        {((config.legendaryWeight / total) * 100).toFixed(1)}%
                      </span>
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      name="legendaryWeight"
                      defaultValue={config.legendaryWeight}
                      className="mt-1"
                    />
                    <Progress 
                      value={(config.legendaryWeight / total) * 100} 
                      className={`mt-2 ${getRarityColor("legendary")}`}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Sauvegarder
                  </Button>
                </Form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
