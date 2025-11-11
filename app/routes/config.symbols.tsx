import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { requireActivePreset } from "~/lib/utils/require-active-preset";
import { getPresetSymbolConfigs, upsertPresetSymbolConfig } from "~/db/queries/preset-symbol-configs";
import { PageHeader } from "~/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Shapes } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const activePresetId = await requireActivePreset();
  const symbolConfigs = await getPresetSymbolConfigs(activePresetId);
  
  return json({ symbolConfigs });
}

export async function action({ request }: ActionFunctionArgs) {
  const activePresetId = await requireActivePreset();
  const formData = await request.formData();
  const symbolId = formData.get("symbolId") as string;
  const weight = parseFloat(formData.get("weight") as string);
  const value = parseInt(formData.get("value") as string);
  const multiplier = parseFloat(formData.get("multiplier") as string);

  if (symbolId && !isNaN(weight) && !isNaN(value) && !isNaN(multiplier)) {
    await upsertPresetSymbolConfig(activePresetId, symbolId, {
      weight,
      value,
      multiplier,
    });
  }

  return json({ success: true });
}

export default function ConfigSymbols() {
  const { symbolConfigs } = useLoaderData<typeof loader>();

  const basicSymbols = symbolConfigs.filter((s) => s.symbol?.type === "basic");
  const premiumSymbols = symbolConfigs.filter((s) => s.symbol?.type === "premium");
  const bonusSymbols = symbolConfigs.filter((s) => s.symbol?.type === "bonus");

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Shapes className="w-8 h-8" />
            Symboles
          </div>
        }
        description="Configuration des symboles du preset actif - Modifiez tous les paramètres"
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
            {basicSymbols.map(({ config, symbol }) => {
              if (!symbol) return null;
              
              return (
                <Card key={config.id}>
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
                    <Form method="post" className="space-y-3">
                      <input type="hidden" name="symbolId" value={symbol.id} />
                      
                      <div>
                        <label className="text-sm font-medium">Poids (Probabilité)</label>
                        <Input
                          type="number"
                          step="0.1"
                          name="weight"
                          defaultValue={config.weight}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Valeur de Base</label>
                        <Input
                          type="number"
                          name="value"
                          defaultValue={config.value}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Multiplicateur</label>
                        <Input
                          type="number"
                          step="0.01"
                          name="multiplier"
                          defaultValue={config.multiplier}
                          className="mt-1"
                        />
                      </div>
                      
                      <Button type="submit" className="w-full" size="sm">
                        Sauvegarder
                      </Button>
                    </Form>
                  </CardContent>
                </Card>
              );
            })}
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
            {premiumSymbols.map(({ config, symbol }) => {
              if (!symbol) return null;
              
              return (
                <Card key={config.id} className="border-primary/50">
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
                    <Form method="post" className="space-y-3">
                      <input type="hidden" name="symbolId" value={symbol.id} />
                      
                      <div>
                        <label className="text-sm font-medium">Poids (Probabilité)</label>
                        <Input
                          type="number"
                          step="0.1"
                          name="weight"
                          defaultValue={config.weight}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Valeur de Base</label>
                        <Input
                          type="number"
                          name="value"
                          defaultValue={config.value}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Multiplicateur</label>
                        <Input
                          type="number"
                          step="0.01"
                          name="multiplier"
                          defaultValue={config.multiplier}
                          className="mt-1"
                        />
                      </div>
                      
                      <Button type="submit" className="w-full" size="sm">
                        Sauvegarder
                      </Button>
                    </Form>
                  </CardContent>
                </Card>
              );
            })}
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
              {bonusSymbols.map(({ config, symbol }) => {
                if (!symbol) return null;
                
                return (
                  <Card key={config.id} className="border-green-500/50">
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
                      <CardDescription>
                        Symbole spécial qui déclenche le mode bonus
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form method="post" className="space-y-3">
                        <input type="hidden" name="symbolId" value={symbol.id} />
                        
                        <div>
                          <label className="text-sm font-medium">Poids (Probabilité)</label>
                          <Input
                            type="number"
                            step="0.1"
                            name="weight"
                            defaultValue={config.weight}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Valeur de Base</label>
                          <Input
                            type="number"
                            name="value"
                            defaultValue={config.value}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Multiplicateur</label>
                          <Input
                            type="number"
                            step="0.01"
                            name="multiplier"
                            defaultValue={config.multiplier}
                            className="mt-1"
                          />
                        </div>
                        
                        <Button type="submit" className="w-full" size="sm">
                          Sauvegarder
                        </Button>
                      </Form>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
