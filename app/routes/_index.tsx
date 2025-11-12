import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData, Form } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/layout/page-header";
import { getAllPresets, createPreset, deletePreset, duplicatePreset } from "~/db/queries/presets";
import { getActivePreset, setActivePreset } from "~/db/queries/active-preset";
import { getAllSimulationRuns } from "~/db/queries/simulations";
import { Save, Plus, Trash2, Star, Copy, Settings, Play, BarChart3, Gamepad2 } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Sélection de Preset - Simulateur BYS" },
    { name: "description", content: "Choisissez ou créez un preset pour configurer votre simulation" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  
  const [presets, activePresetData, allRuns] = await Promise.all([
    getAllPresets(),
    getActivePreset(),
    getAllSimulationRuns(),
  ]);

  // Calculer les stats par preset
  const presetStats = presets.map((preset) => {
    const presetRuns = allRuns.filter((run) => run.presetId === preset.id);
    const completedRuns = presetRuns.filter((run) => run.status === "completed");
    
    return {
      presetId: preset.id,
      totalRuns: presetRuns.length,
      completedRuns: completedRuns.length,
      successRate: presetRuns.length > 0 
        ? (completedRuns.length / presetRuns.length) * 100 
        : 0,
    };
  });

  return json({
    presets,
    activePresetId: activePresetData?.presetId || null,
    presetStats,
    errorMessage: error === "no-preset" ? "Veuillez sélectionner un preset pour continuer" : null,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id") as string;
    await deletePreset(id);
    return json({ success: true });
  }

  if (intent === "create") {
    const name = formData.get("name") as string || "Nouveau Preset";
    const description = formData.get("description") as string || "Configuration personnalisée";
    
    const newPreset = await createPreset({
      name,
      description,
      tags: ["custom"],
      isFavorite: false,
    });

    // Activer automatiquement le nouveau preset
    await setActivePreset(newPreset.id);
    return redirect("/config");
  }

  if (intent === "duplicate") {
    const sourceId = formData.get("id") as string;
    const name = formData.get("name") as string || "Copie de preset";
    
    const newPreset = await duplicatePreset(sourceId, name);
    await setActivePreset(newPreset.id);
    return redirect("/config");
  }

  if (intent === "setActive") {
    const id = formData.get("id") as string;
    await setActivePreset(id);
    return redirect("/config");
  }

  return json({ success: false });
}

export default function Index() {
  const { presets, activePresetId, presetStats, errorMessage } = useLoaderData<typeof loader>();
  const activePreset = presets.find((p) => p.id === activePresetId);

  // Séparer favoris et non-favoris
  const favoritePresets = presets.filter((p) => p.isFavorite);
  const otherPresets = presets.filter((p) => !p.isFavorite);

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Save className="w-8 h-8" />
            Sélection de Preset
          </div>
        }
        description="Choisissez un preset pour configurer et lancer vos simulations"
        actions={
          <div className="flex gap-2">
            <Link to="/stats">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Statistiques
              </Button>
            </Link>
          </div>
        }
      />

      {errorMessage && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-destructive font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Preset Actif */}
      {activePreset && (
        <Card className="mb-8 border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default">Actif</Badge>
              {activePreset.name}
            </CardTitle>
            <CardDescription>{activePreset.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Link to="/config" className="flex-1">
                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurer
                </Button>
              </Link>
              <Link to="/simulator" className="flex-1">
                <Button variant="default" className="w-full">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Simuler
                </Button>
              </Link>
              <Link to={`/stats?preset=${activePreset.id}`}>
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4" />
              </Button>
            </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Créer un nouveau preset */}
      <Card className="mb-8">
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Créer un nouveau preset
          </CardTitle>
            <CardDescription>
            Un preset contient toute la configuration de votre simulation
            </CardDescription>
          </CardHeader>
          <CardContent>
          <Form method="post" className="flex gap-2">
            <input type="hidden" name="intent" value="create" />
            <Input
              type="text"
              name="name"
              placeholder="Nom du preset"
              defaultValue="Nouveau Preset"
              className="flex-1"
            />
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Créer et Activer
            </Button>
          </Form>
        </CardContent>
      </Card>

      {/* Liste des presets */}
      {presets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-12">
              <div className="flex justify-center mb-4">
                <Save className="w-24 h-24" />
              </div>
              <p className="mb-4">Aucun preset disponible</p>
              <p className="text-sm mb-6">
                Créez votre premier preset pour commencer à configurer et simuler
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Favoris */}
          {favoritePresets.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 fill-primary text-primary" />
                Favoris
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favoritePresets.map((preset) => {
                  const stats = presetStats.find((s) => s.presetId === preset.id);
                  const isActive = preset.id === activePresetId;
                  
                  return (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      stats={stats}
                      isActive={isActive}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Autres presets */}
          {otherPresets.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Tous les presets
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {otherPresets.map((preset) => {
                  const stats = presetStats.find((s) => s.presetId === preset.id);
                  const isActive = preset.id === activePresetId;
                  
                  return (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      stats={stats}
                      isActive={isActive}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PresetCard({
  preset,
  stats,
  isActive,
}: {
  preset: any;
  stats: any;
  isActive: boolean;
}) {
  return (
    <Card className={isActive ? "border-primary/50" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {preset.name}
            {isActive && <Badge variant="default">Actif</Badge>}
          </CardTitle>
        </div>
        <CardDescription>{preset.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {preset.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Stats */}
          {stats && stats.totalRuns > 0 && (
            <div className="text-sm text-muted-foreground">
              <div>{stats.totalRuns} simulation{stats.totalRuns > 1 ? 's' : ''}</div>
              <div>{stats.successRate.toFixed(0)}% de succès</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-3">
            {!isActive && (
              <Form method="post" className="flex-1">
                <input type="hidden" name="intent" value="setActive" />
                <input type="hidden" name="id" value={preset.id} />
                <Button className="w-full" size="sm" variant="default">
                  Activer
                </Button>
              </Form>
            )}
            
            {isActive && (
              <Link to="/config" className="flex-1">
                <Button className="w-full" size="sm" variant="secondary">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurer
                </Button>
              </Link>
            )}
            
            <Form method="post">
              <input type="hidden" name="intent" value="duplicate" />
              <input type="hidden" name="id" value={preset.id} />
              <input type="hidden" name="name" value={`Copie de ${preset.name}`} />
              <Button type="submit" variant="outline" size="sm">
                <Copy className="w-4 h-4" />
              </Button>
            </Form>
            
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={preset.id} />
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={isActive}
                onClick={(e) => {
                  if (!confirm("Êtes-vous sûr de vouloir supprimer ce preset ?")) {
                    e.preventDefault();
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
