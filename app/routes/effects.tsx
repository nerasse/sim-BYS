import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllEffects } from "~/db/queries/effects";
import { PageHeader } from "~/components/layout/page-header";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { EFFECT_TARGETS } from "~/lib/constants/effect-types";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Effets - Simulateur BYS" },
    { name: "description", content: "Bibliothèque des effets (lecture seule)" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const effects = await getAllEffects();
  return json({ effects });
}

const categoryColors: Record<string, string> = {
  passive: "bg-blue-500",
  active: "bg-green-500",
  trigger: "bg-purple-500",
};

export default function Effects() {
  const { effects } = useLoaderData<typeof loader>();
  const [showTargets, setShowTargets] = useState(false);

  return (
    <div className="space-y-8">
      {/* TARGETS SECTION - COLLAPSIBLE */}
      <div className="border rounded-lg bg-muted/20">
        <Button
          variant="ghost"
          onClick={() => setShowTargets(!showTargets)}
          className="w-full justify-between p-4 h-auto hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div className="text-left">
              <h2 className="text-lg font-bold">Cibles d'Effets</h2>
              <p className="text-xs text-muted-foreground font-normal">Constantes système (liées simulation)</p>
            </div>
          </div>
          {showTargets ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </Button>

        {showTargets && (
          <div className="p-4 pt-0">
            <div className="grid grid-cols-4 gap-2">
              {EFFECT_TARGETS.map((target) => (
                <div key={target.value} className="border rounded-lg p-3 bg-background">
                  <div className="space-y-2">
                    <span className="text-2xl">{target.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{target.label}</div>
                      <code className="text-xs text-muted-foreground">{target.value}</code>
                      <p className="text-xs text-muted-foreground mt-1">{target.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EFFECTS SECTION - READ ONLY */}
      <div className="space-y-6">
        <div>
          <PageHeader
            title="⚡ Effets"
            description="Bibliothèque hard-codée des effets (lecture seule - liés au moteur de simulation)"
          />
          <p className="text-sm text-muted-foreground mt-2">
            ⚠️ Ces effets sont référencés par le moteur. Pour en modifier/ajouter, il faut adapter le code de simulation.
          </p>
        </div>

      {/* Table List - Read Only */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="text-left p-4 font-semibold">Effet</th>
              <th className="text-left p-4 font-semibold">Code Technique</th>
              <th className="text-left p-4 font-semibold">Type</th>
              <th className="text-left p-4 font-semibold">Catégorie</th>
              <th className="text-left p-4 font-semibold">Cible</th>
            </tr>
          </thead>
          <tbody>
            {effects.map((effect) => (
              <tr key={effect.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {effect.icon && <span className="text-2xl">{effect.icon}</span>}
                    <div>
                      <div className="font-semibold">{effect.displayName}</div>
                      <div className="text-sm text-muted-foreground mt-1">{effect.description}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{effect.name}</code>
                </td>
                <td className="p-4">
                  <Badge variant="outline" className="font-mono text-xs">{effect.type}</Badge>
                </td>
                <td className="p-4">
                  <Badge className={`${categoryColors[effect.category]} text-white`}>
                    {effect.category}
                  </Badge>
                </td>
                <td className="p-4">
                  <span className="text-sm">{effect.target || "-"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {effects.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <p>Aucun effet dans la base</p>
            <p className="text-sm mt-2">Exécutez <code className="bg-muted px-2 py-1 rounded">npm run db:seed</code></p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
