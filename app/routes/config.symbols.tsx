import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllSymbols } from "~/db/queries/symbols";
import { PageHeader } from "~/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export const meta: MetaFunction = () => {
  return [
    { title: "Symboles - Configuration - Simulateur BYS" },
    {
      name: "description",
      content: "Configuration des 9 symboles du jeu",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const symbols = await getAllSymbols();
  return json({ symbols });
}

export default function ConfigSymbols() {
  const { symbols } = useLoaderData<typeof loader>();

  const basicSymbols = symbols.filter((s) => s.type === "basic");
  const premiumSymbols = symbols.filter((s) => s.type === "premium");
  const bonusSymbols = symbols.filter((s) => s.type === "bonus");

  return (
    <div>
      <PageHeader
        title="Symboles"
        description="Configuration des 9 symboles du jeu"
      />

      <div className="space-y-8">
        {/* Basic Symbols */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Symboles Basiques
            <Badge variant="secondary" className="ml-3">
              {basicSymbols.length}
            </Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {basicSymbols.map((symbol) => (
              <Card key={symbol.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-4xl">{symbol.icon}</span>
                      <span>{symbol.name}</span>
                    </CardTitle>
                    <Badge
                      style={{
                        backgroundColor: symbol.color || undefined,
                      }}
                    >
                      {symbol.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Poids:</span>
                      <span className="font-medium">{symbol.baseWeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valeur:</span>
                      <span className="font-medium">{symbol.baseValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Multiplicateur:
                      </span>
                      <span className="font-medium">
                        ×{symbol.baseMultiplier}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Premium Symbols */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Symboles Premium
            <Badge variant="secondary" className="ml-3">
              {premiumSymbols.length}
            </Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {premiumSymbols.map((symbol) => (
              <Card key={symbol.id} className="border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-4xl">{symbol.icon}</span>
                      <span>{symbol.name}</span>
                    </CardTitle>
                    <Badge
                      variant="default"
                      style={{
                        backgroundColor: symbol.color || undefined,
                      }}
                    >
                      {symbol.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Poids:</span>
                      <span className="font-medium">{symbol.baseWeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valeur:</span>
                      <span className="font-medium text-primary">
                        {symbol.baseValue}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Multiplicateur:
                      </span>
                      <span className="font-medium text-primary">
                        ×{symbol.baseMultiplier}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bonus Symbols */}
        {bonusSymbols.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Symboles Bonus
              <Badge variant="secondary" className="ml-3">
                {bonusSymbols.length}
              </Badge>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bonusSymbols.map((symbol) => (
                <Card key={symbol.id} className="border-green-500/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-4xl">{symbol.icon}</span>
                        <span>{symbol.name}</span>
                      </CardTitle>
                      <Badge
                        style={{
                          backgroundColor: symbol.color || undefined,
                        }}
                      >
                        {symbol.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Symbole spécial qui déclenche le mode bonus
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Distribution des Poids</CardTitle>
            <CardDescription>
              Probabilité d'apparition de chaque symbole
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {symbols.map((symbol) => {
                const totalWeight = symbols.reduce(
                  (sum, s) => sum + s.baseWeight,
                  0
                );
                const percentage = (
                  (symbol.baseWeight / totalWeight) *
                  100
                ).toFixed(1);

                return (
                  <div key={symbol.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{symbol.icon}</span>
                        <span className="text-sm font-medium">
                          {symbol.name}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

