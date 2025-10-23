import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllCharacters } from "~/db/queries/characters";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export const meta: MetaFunction = () => {
  return [
    { title: "Personnages - Configuration - Simulateur BYS" },
    { name: "description", content: "Personnages jouables" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const characters = await getAllCharacters();
  return json({ characters });
}

export default function ConfigCharacters() {
  const { characters } = useLoaderData<typeof loader>();

  return (
    <div>
      <PageHeader
        title="Personnages"
        description="Personnages jouables avec leurs effets passifs"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <Card key={character.id} className={!character.isUnlocked ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">👤 {character.name}</CardTitle>
                <Badge variant={character.isUnlocked ? "default" : "secondary"}>
                  {character.isUnlocked ? "Débloqué" : "Verrouillé"}
                </Badge>
              </div>
              <CardDescription>{character.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Effet Passif</h4>
                  <div className="bg-primary/10 p-3 rounded-md">
                    <div className="text-sm">
                      <span className="font-medium">{character.passiveEffect.type}</span>
                      <span className="text-muted-foreground"> : </span>
                      <span className="text-primary font-bold">+{character.passiveEffect.value}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Stats de Base</h4>
                  <div className="space-y-2">
                    {character.baseStats.chance !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Chance:</span>
                        <span className="font-medium">{character.baseStats.chance}%</span>
                      </div>
                    )}
                    {character.baseStats.multiplier !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Multiplicateur:</span>
                        <span className="font-medium">×{character.baseStats.multiplier}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Scaling par Niveau</h4>
                  <div className="space-y-2">
                    {character.scalingPerLevel.chance !== undefined && character.scalingPerLevel.chance > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Chance/lvl:</span>
                        <span className="font-medium text-primary">+{character.scalingPerLevel.chance}%</span>
                      </div>
                    )}
                    {character.scalingPerLevel.multiplier !== undefined && character.scalingPerLevel.multiplier > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mult./lvl:</span>
                        <span className="font-medium text-primary">+{character.scalingPerLevel.multiplier}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Bonus de Départ</h4>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{character.startingBonus}</code>
                </div>

                {!character.isUnlocked && character.unlockCondition && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-1">🔒 Condition de Déblocage</h4>
                    <p className="text-sm text-muted-foreground">{character.unlockCondition}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

