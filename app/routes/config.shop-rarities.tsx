import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { getAllShopRarityConfigs, updateShopRarityConfig } from "~/db/queries/shop-rarity-configs";
import { configCache } from "~/lib/utils/config-cache";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/layout/page-header";
import { Progress } from "~/components/ui/progress";
import { Info } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const configs = await getAllShopRarityConfigs();
  return json({ configs });
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const world = parseInt(formData.get("world") as string);
  const commonWeight = parseFloat(formData.get("commonWeight") as string);
  const uncommonWeight = parseFloat(formData.get("uncommonWeight") as string);
  const rareWeight = parseFloat(formData.get("rareWeight") as string);
  const epicWeight = parseFloat(formData.get("epicWeight") as string);
  const legendaryWeight = parseFloat(formData.get("legendaryWeight") as string);

  if (!isNaN(world)) {
    await updateShopRarityConfig(world, {
      commonWeight,
      uncommonWeight,
      rareWeight,
      epicWeight,
      legendaryWeight,
    });
    await configCache.updateShopRarityConfig(world);
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
        description="Gérer les probabilités d'apparition des raretés de jokers par monde"
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
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        <span className={`w-3 h-3 rounded ${getRarityColor("common")}`} />
                        Commun
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
                        className="mt-1 h-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        <span className={`w-3 h-3 rounded ${getRarityColor("uncommon")}`} />
                        Peu Commun
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
                        className="mt-1 h-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        <span className={`w-3 h-3 rounded ${getRarityColor("rare")}`} />
                        Rare
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
                        className="mt-1 h-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        <span className={`w-3 h-3 rounded ${getRarityColor("epic")}`} />
                        Épique
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
                        className="mt-1 h-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        <span className={`w-3 h-3 rounded ${getRarityColor("legendary")}`} />
                        Légendaire
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
                        className="mt-1 h-1"
                      />
                    </div>
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

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Poids de rareté</strong> : Détermine la probabilité d'apparition de chaque rareté dans la boutique.
          </p>
          <p>
            <strong>Ascension</strong> : Les poids sont ajustés automatiquement selon le niveau d'ascension (-3% commun, +1% peu commun, +1.5% rare, +0.4% épique, +0.1% légendaire par niveau).
          </p>
          <p>
            <strong>Chance</strong> : La stat Chance du joueur augmente légèrement les probabilités des raretés supérieures.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

