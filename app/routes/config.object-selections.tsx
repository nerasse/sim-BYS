import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { requireActivePreset } from "~/lib/utils/require-active-preset";
import { getPresetBonusAvailabilities, upsertPresetBonusAvailability, deletePresetBonusAvailability } from "~/db/queries/preset-bonus-availability";
import { getPresetJokerAvailabilities, upsertPresetJokerAvailability, deletePresetJokerAvailability } from "~/db/queries/preset-joker-availability";
import { getAllBonuses } from "~/db/queries/bonuses";
import { getAllJokers } from "~/db/queries/jokers";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Sparkles } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const activePresetId = await requireActivePreset();
  
  const [bonusAvailabilities, jokerAvailabilities, allBonuses, allJokers] = await Promise.all([
    getPresetBonusAvailabilities(activePresetId),
    getPresetJokerAvailabilities(activePresetId),
    getAllBonuses(),
    getAllJokers(),
  ]);

  return json({
    bonusAvailabilities,
    jokerAvailabilities,
    allBonuses,
    allJokers,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const activePresetId = await requireActivePreset();
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "addBonus") {
    const bonusId = formData.get("bonusId") as string;
    const availableFrom = formData.get("availableFrom") as string;
    const availableUntil = (formData.get("availableUntil") as string) || null;

    await upsertPresetBonusAvailability(activePresetId, bonusId, availableFrom, availableUntil);
    return json({ success: true });
  }

  if (intent === "removeBonus") {
    const bonusId = formData.get("bonusId") as string;
    await deletePresetBonusAvailability(activePresetId, bonusId);
    return json({ success: true });
  }

  if (intent === "addJoker") {
    const jokerId = formData.get("jokerId") as string;
    const availableFrom = formData.get("availableFrom") as string;
    const availableUntil = (formData.get("availableUntil") as string) || null;

    await upsertPresetJokerAvailability(activePresetId, jokerId, availableFrom, availableUntil);
    return json({ success: true });
  }

  if (intent === "removeJoker") {
    const jokerId = formData.get("jokerId") as string;
    await deletePresetJokerAvailability(activePresetId, jokerId);
    return json({ success: true });
  }

  return json({ success: false });
}

const LEVELS = [
  "1-1", "1-2", "1-3",
  "2-1", "2-2", "2-3",
  "3-1", "3-2", "3-3",
  "4-1", "4-2", "4-3",
  "5-1", "5-2", "5-3",
  "6-1", "6-2", "6-3",
  "7-1", "7-2", "7-3",
];

const BOSS_LEVELS = ["1-3", "2-3", "3-3", "4-3", "5-3", "6-3", "7-3"];

export default function ConfigObjectSelections() {
  const { bonusAvailabilities, jokerAvailabilities, allBonuses, allJokers } = 
    useLoaderData<typeof loader>();

  const gameBonus = allBonuses.filter((b) => b.type === "game");

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            Configuration Objets par Niveau
          </div>
        }
        description="Définissez quels bonus et jokers sont disponibles à chaque niveau"
      />

      <div className="space-y-8">
        {/* Bonus Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Bonus Disponibles</CardTitle>
            <CardDescription>
              Configurez quels bonus peuvent être sélectionnés en récompense (niveaux boss)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Liste des bonus configurés */}
              <div>
                <h3 className="text-sm font-medium mb-3">Bonus Configurés</h3>
                {bonusAvailabilities.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Aucun bonus configuré. Par défaut, tous les bonus sont disponibles à tous les niveaux.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bonusAvailabilities.map(({ availability, bonus }) => {
                      if (!bonus) return null;
                      
                      return (
                        <div key={availability.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge>{bonus.rarity}</Badge>
                            <div>
                              <div className="font-medium">{bonus.name}</div>
                              <div className="text-sm text-muted-foreground">
                                De {availability.availableFrom} 
                                {availability.availableUntil && ` à ${availability.availableUntil}`}
                              </div>
                            </div>
                          </div>
                          <Form method="post">
                            <input type="hidden" name="intent" value="removeBonus" />
                            <input type="hidden" name="bonusId" value={bonus.id} />
                            <Button type="submit" variant="destructive" size="sm">
                              Retirer
                            </Button>
                          </Form>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Formulaire d'ajout */}
              <div>
                <h3 className="text-sm font-medium mb-3">Ajouter un Bonus</h3>
                <Form method="post" className="flex gap-2">
                  <input type="hidden" name="intent" value="addBonus" />
                  <select name="bonusId" className="flex-1 p-2 rounded-md border bg-background" required>
                    <option value="">Sélectionner un bonus...</option>
                    {gameBonus.map((bonus) => (
                      <option key={bonus.id} value={bonus.id}>
                        {bonus.name} ({bonus.rarity})
                      </option>
                    ))}
                  </select>
                  <select name="availableFrom" className="p-2 rounded-md border bg-background" required>
                    <option value="">Depuis...</option>
                    {BOSS_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <select name="availableUntil" className="p-2 rounded-md border bg-background">
                    <option value="">Jusqu'à...</option>
                    {BOSS_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <Button type="submit">Ajouter</Button>
                </Form>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jokers Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Jokers Disponibles</CardTitle>
            <CardDescription>
              Configurez quels jokers peuvent apparaître dans les boutiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Liste des jokers configurés */}
              <div>
                <h3 className="text-sm font-medium mb-3">Jokers Configurés</h3>
                {jokerAvailabilities.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Aucun joker configuré. Par défaut, tous les jokers sont disponibles à tous les niveaux.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {jokerAvailabilities.map(({ availability, joker }) => {
                      if (!joker) return null;
                      
                      return (
                        <div key={availability.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge>{joker.rarity}</Badge>
                            <div>
                              <div className="font-medium">{joker.name}</div>
                              <div className="text-sm text-muted-foreground">
                                De {availability.availableFrom}
                                {availability.availableUntil && ` à ${availability.availableUntil}`}
                              </div>
                            </div>
                          </div>
                          <Form method="post">
                            <input type="hidden" name="intent" value="removeJoker" />
                            <input type="hidden" name="jokerId" value={joker.id} />
                            <Button type="submit" variant="destructive" size="sm">
                              Retirer
                            </Button>
                          </Form>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Formulaire d'ajout */}
              <div>
                <h3 className="text-sm font-medium mb-3">Ajouter un Joker</h3>
                <Form method="post" className="flex gap-2">
                  <input type="hidden" name="intent" value="addJoker" />
                  <select name="jokerId" className="flex-1 p-2 rounded-md border bg-background" required>
                    <option value="">Sélectionner un joker...</option>
                    {allJokers.map((joker) => (
                      <option key={joker.id} value={joker.id}>
                        {joker.name} ({joker.rarity})
                      </option>
                    ))}
                  </select>
                  <select name="availableFrom" className="p-2 rounded-md border bg-background" required>
                    <option value="">Depuis...</option>
                    {LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <select name="availableUntil" className="p-2 rounded-md border bg-background">
                    <option value="">Jusqu'à...</option>
                    {LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <Button type="submit">Ajouter</Button>
                </Form>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-sm space-y-2">
              <p>
                <strong>Bonus</strong> : Disponibles en récompense après les niveaux boss (X-3).
                Si aucun bonus n'est configuré, tous les bonus de type "game" seront disponibles.
              </p>
              <p>
                <strong>Jokers</strong> : Disponibles dans les boutiques entre les niveaux.
                Si aucun joker n'est configuré, tous les jokers seront disponibles.
              </p>
              <p>
                <strong>Plage de disponibilité</strong> : "Depuis" est obligatoire, "Jusqu'à" est optionnel.
                Sans "Jusqu'à", l'objet reste disponible jusqu'à la fin de la run.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

