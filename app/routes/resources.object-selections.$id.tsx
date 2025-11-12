import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { getObjectSelectionPresetById } from "~/db/queries/object-selection-presets";
import { 
  getObjectSelectionBonuses,
  upsertObjectSelectionBonus,
  deleteObjectSelectionBonus
} from "~/db/queries/object-selection-bonuses";
import { 
  getObjectSelectionJokers,
  upsertObjectSelectionJoker,
  deleteObjectSelectionJoker
} from "~/db/queries/object-selection-jokers";
import { getAllBonuses } from "~/db/queries/bonuses";
import { getAllJokers } from "~/db/queries/jokers";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Configurer Sélection d'Objets - Ressources - Simulateur BYS" },
    { name: "description", content: "Configurer la disponibilité des objets par niveau" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  const [preset, bonusConfigs, jokerConfigs, allBonuses, allJokers] = await Promise.all([
    getObjectSelectionPresetById(id),
    getObjectSelectionBonuses(id),
    getObjectSelectionJokers(id),
    getAllBonuses(),
    getAllJokers(),
  ]);

  if (!preset) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ 
    preset, 
    bonusConfigs, 
    jokerConfigs, 
    allBonuses, 
    allJokers 
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "toggle-bonus") {
    const bonusId = formData.get("bonusId") as string;
    const isEnabled = formData.get("isEnabled") === "true";

    if (isEnabled) {
      await upsertObjectSelectionBonus(id, bonusId, "1-1", null);
    } else {
      await deleteObjectSelectionBonus(id, bonusId);
    }

    return json({ success: true });
  }

  if (intent === "toggle-joker") {
    const jokerId = formData.get("jokerId") as string;
    const isEnabled = formData.get("isEnabled") === "true";

    if (isEnabled) {
      await upsertObjectSelectionJoker(id, jokerId, "1-1", null);
    } else {
      await deleteObjectSelectionJoker(id, jokerId);
    }

    return json({ success: true });
  }

  return json({ success: false });
}

export default function ResourcesObjectSelectionDetail() {
  const { preset, bonusConfigs, jokerConfigs, allBonuses, allJokers } = 
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const enabledBonusIds = new Set(
    bonusConfigs.map((config) => config.availability!.bonusId)
  );

  const enabledJokerIds = new Set(
    jokerConfigs.map((config) => config.availability!.jokerId)
  );

  const handleToggleBonus = (bonusId: string, isEnabled: boolean) => {
    fetcher.submit(
      {
        intent: "toggle-bonus",
        bonusId,
        isEnabled: isEnabled.toString(),
      },
      { method: "post" }
    );
  };

  const handleToggleJoker = (jokerId: string, isEnabled: boolean) => {
    fetcher.submit(
      {
        intent: "toggle-joker",
        jokerId,
        isEnabled: isEnabled.toString(),
      },
      { method: "post" }
    );
  };

  return (
    <div>
      <PageHeader
        title={preset.name}
        description={preset.description || "Configuration de la disponibilité des objets"}
        actions={
          <Link to="/resources/object-selections">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bonus Section */}
        <Card>
          <CardHeader>
            <CardTitle>Bonus Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allBonuses.map((bonus) => {
                const isEnabled = enabledBonusIds.has(bonus.id);
                return (
                  <div
                    key={bonus.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          handleToggleBonus(bonus.id, checked as boolean)
                        }
                      />
                      <div>
                        <div className="font-medium">{bonus.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {bonus.description}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{bonus.rarity}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Jokers Section */}
        <Card>
          <CardHeader>
            <CardTitle>Jokers Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allJokers.map((joker) => {
                const isEnabled = enabledJokerIds.has(joker.id);
                return (
                  <div
                    key={joker.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          handleToggleJoker(joker.id, checked as boolean)
                        }
                      />
                      <div>
                        <div className="font-medium">{joker.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {joker.description}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{joker.rarity}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Par défaut, les objets sélectionnés sont disponibles du niveau 1-1 jusqu'à la fin.
          Une configuration avancée par niveau sera ajoutée prochainement.
        </p>
      </div>
    </div>
  );
}

