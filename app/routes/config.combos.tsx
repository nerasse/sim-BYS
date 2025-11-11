import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { requireActivePreset } from "~/lib/utils/require-active-preset";
import { getPresetComboConfigs, upsertPresetComboConfig } from "~/db/queries/preset-combo-configs";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Target } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const activePresetId = await requireActivePreset();
  const comboConfigs = await getPresetComboConfigs(activePresetId);
  
  return json({ comboConfigs });
}

export async function action({ request }: ActionFunctionArgs) {
  const activePresetId = await requireActivePreset();
  const formData = await request.formData();
  const comboId = formData.get("comboId") as string;
  const multiplier = parseFloat(formData.get("multiplier") as string);
  const isActive = formData.get("isActive") === "true";

  if (comboId && !isNaN(multiplier)) {
    await upsertPresetComboConfig(activePresetId, comboId, {
      multiplier,
      isActive,
    });
  }

  return json({ success: true });
}

export default function ConfigCombos() {
  const { comboConfigs } = useLoaderData<typeof loader>();

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8" />
            Combinaisons
          </div>
        }
        description="Configuration des combinaisons du preset actif - Modifiez multiplicateurs et activez/désactivez"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {comboConfigs.map(({ config, combo }) => {
          if (!combo) return null;
          
          return (
            <Card key={config.id} className={!config.isActive ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{combo.displayName}</CardTitle>
                  <Badge variant={config.isActive ? "default" : "secondary"}>
                    {config.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <CardDescription>{combo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="comboId" value={combo.id} />
                  
                  <div>
                    <label className="text-sm font-medium">Multiplicateur de Base</label>
                    <Input
                      type="number"
                      step="0.1"
                      name="multiplier"
                      defaultValue={config.multiplier}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      value="true"
                      defaultChecked={config.isActive}
                      className="w-4 h-4"
                    />
                    <label className="text-sm font-medium">Combinaison active</label>
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
  );
}
