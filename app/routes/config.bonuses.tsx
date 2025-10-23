import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllBonuses } from "~/db/queries/bonuses";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export const meta: MetaFunction = () => {
  return [
    { title: "Bonus - Configuration - Simulateur BYS" },
    { name: "description", content: "Bibliothèque des bonus disponibles" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const bonuses = await getAllBonuses();
  return json({ bonuses });
}

const rarityColors: Record<string, string> = {
  common: "bg-gray-500",
  uncommon: "bg-green-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-orange-500",
};

export default function ConfigBonuses() {
  const { bonuses } = useLoaderData<typeof loader>();

  const startingBonuses = bonuses.filter((b) => b.type === "starting");
  const gameBonuses = bonuses.filter((b) => b.type === "game");

  return (
    <div>
      <PageHeader
        title="Bonus"
        description="Bibliothèque des bonus disponibles dans le jeu"
      />

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Bonus de Départ
            <Badge variant="secondary" className="ml-3">{startingBonuses.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {startingBonuses.map((bonus) => (
              <Card key={bonus.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{bonus.name}</CardTitle>
                    <Badge className={rarityColors[bonus.rarity]}>
                      {bonus.rarity}
                    </Badge>
                  </div>
                  <CardDescription>{bonus.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valeur de base:</span>
                      <span className="font-medium">{bonus.baseValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Niveau max:</span>
                      <span className="font-medium">{bonus.maxLevel}</span>
                    </div>
                    {bonus.isDestructible && (
                      <Badge variant="destructive" className="mt-2">
                        🔥 Destructible
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">
            Bonus de Partie
            <Badge variant="secondary" className="ml-3">{gameBonuses.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gameBonuses.map((bonus) => (
              <Card key={bonus.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{bonus.name}</CardTitle>
                    <Badge className={rarityColors[bonus.rarity]}>
                      {bonus.rarity}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{bonus.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base:</span>
                      <span className="font-medium">{bonus.baseValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scaling/lvl:</span>
                      <span className="font-medium text-primary">+{bonus.scalingPerLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Niveau max:</span>
                      <span className="font-medium">{bonus.maxLevel}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <span className="text-muted-foreground">Effets:</span>
                      <div className="mt-1 space-y-1">
                        {bonus.effects.map((effect, idx) => (
                          <div key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                            {effect.type}
                            {effect.target && ` (${effect.target})`}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

