import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllCombinations } from "~/db/queries/combos";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export const meta: MetaFunction = () => {
  return [
    { title: "Combinaisons - Configuration - Simulateur BYS" },
    { name: "description", content: "Configuration des 11 types de combinaisons" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const combinations = await getAllCombinations();
  return json({ combinations });
}

export default function ConfigCombos() {
  const { combinations } = useLoaderData<typeof loader>();

  return (
    <div>
      <PageHeader
        title="Combinaisons"
        description="Configuration des 11 types de combinaisons gagnantes"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {combinations.map((combo) => (
          <Card key={combo.id} className={!combo.isActive ? "opacity-50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{combo.displayName}</CardTitle>
                <Badge variant={combo.isActive ? "default" : "secondary"}>
                  {combo.isActive ? "Actif" : "Inactif"}
                </Badge>
              </div>
              <CardDescription>{combo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Multiplicateur de base:</span>
                  <span className="text-lg font-bold text-primary">×{combo.baseMultiplier}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ordre de détection:</span>
                  <Badge variant="outline">{combo.detectionOrder}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ID:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{combo.id}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>🎯 Ordre de Détection</CardTitle>
          <CardDescription>
            Les combos sont détectés dans cet ordre, avec déduplication des symboles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {combinations
              .sort((a, b) => a.detectionOrder - b.detectionOrder)
              .map((combo) => (
                <li key={combo.id} className="flex items-center gap-3">
                  <span className="text-muted-foreground font-mono text-sm w-8">
                    {combo.detectionOrder}.
                  </span>
                  <span className="font-medium">{combo.displayName}</span>
                  <span className="text-sm text-muted-foreground">({combo.id})</span>
                  <span className="ml-auto text-primary font-medium">×{combo.baseMultiplier}</span>
                </li>
              ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

