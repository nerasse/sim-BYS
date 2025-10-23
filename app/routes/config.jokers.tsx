import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllJokers } from "~/db/queries/jokers";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export const meta: MetaFunction = () => {
  return [
    { title: "Jokers - Configuration - Simulateur BYS" },
    { name: "description", content: "Bibliothèque des jokers disponibles" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const jokers = await getAllJokers();
  return json({ jokers });
}

const rarityColors: Record<string, string> = {
  common: "bg-gray-500",
  uncommon: "bg-green-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-orange-500",
};

export default function ConfigJokers() {
  const { jokers } = useLoaderData<typeof loader>();

  const jokersByRarity = {
    common: jokers.filter((j) => j.rarity === "common"),
    uncommon: jokers.filter((j) => j.rarity === "uncommon"),
    rare: jokers.filter((j) => j.rarity === "rare"),
    epic: jokers.filter((j) => j.rarity === "epic"),
    legendary: jokers.filter((j) => j.rarity === "legendary"),
  };

  return (
    <div>
      <PageHeader
        title="Jokers"
        description="Bibliothèque des jokers disponibles dans la boutique"
      />

      <div className="space-y-8">
        {Object.entries(jokersByRarity).map(([rarity, jokersOfRarity]) => {
          if (jokersOfRarity.length === 0) return null;

          return (
            <div key={rarity}>
              <h2 className="text-2xl font-bold mb-4 capitalize">
                {rarity}
                <Badge variant="secondary" className="ml-3">
                  {jokersOfRarity.length}
                </Badge>
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jokersOfRarity.map((joker) => (
                  <Card key={joker.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">🃏 {joker.name}</CardTitle>
                        <Badge className={rarityColors[joker.rarity]}>
                          {joker.rarity}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {joker.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Prix de base:</span>
                          <span className="font-medium">{joker.basePrice}$</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valeur de revente:</span>
                          <span className="font-medium">{joker.sellValue}$</span>
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-muted-foreground">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {joker.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-muted-foreground">Effets:</span>
                          <div className="mt-1 space-y-1">
                            {joker.effects.map((effect, idx) => (
                              <div key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                                {effect.type}: {effect.value}
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
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📊 Statistiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {Object.entries(jokersByRarity).map(([rarity, jokersOfRarity]) => (
              <div key={rarity} className="text-center">
                <div className={`text-3xl font-bold ${rarityColors[rarity]} bg-clip-text text-transparent`}>
                  {jokersOfRarity.length}
                </div>
                <div className="text-sm text-muted-foreground capitalize">{rarity}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

