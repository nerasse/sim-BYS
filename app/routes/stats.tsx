import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { getAllSimulationRuns } from "~/db/queries/simulations";
import { getPlayerProgress } from "~/db/queries/progress";
import { getAllPresets } from "~/db/queries/presets";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { BarChart3 } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Statistiques - Simulateur BYS" },
    { name: "description", content: "Statistiques et méta-analyse par preset" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const selectedPresetId = url.searchParams.get("preset");

  const [runs, progress, presets] = await Promise.all([
    getAllSimulationRuns(),
    getPlayerProgress(),
    getAllPresets(),
  ]);

  // Filtrer par preset si sélectionné
  const filteredRuns = selectedPresetId
    ? runs.filter((r) => r.presetId === selectedPresetId)
    : runs;

  // Calculate stats
  const totalRuns = filteredRuns.length;
  const completedRuns = filteredRuns.filter((r) => r.status === "completed");
  const successfulRuns = completedRuns.filter((r) => r.successRate > 0);
  const fullyCompletedRuns = completedRuns.filter((r) => r.completedFully);

  const globalSuccessRate =
    totalRuns > 0 ? (successfulRuns.length / totalRuns) * 100 : 0;
  const completionRate =
    totalRuns > 0 ? (fullyCompletedRuns.length / totalRuns) * 100 : 0;

  // Stats by ascension
  const runsByAscension: Record<number, typeof filteredRuns> = {};
  for (const run of filteredRuns) {
    if (!runsByAscension[run.ascension]) {
      runsByAscension[run.ascension] = [];
    }
    runsByAscension[run.ascension].push(run);
  }

  // Stats par preset
  const presetStats = presets.map((preset) => {
    const presetRuns = runs.filter((run) => run.presetId === preset.id);
    const presetCompleted = presetRuns.filter((r) => r.status === "completed");
    const presetSuccessful = presetCompleted.filter((r) => r.successRate > 0);
    
    return {
      presetId: preset.id,
      presetName: preset.name,
      totalRuns: presetRuns.length,
      completedRuns: presetCompleted.length,
      successRate: presetRuns.length > 0 
        ? (presetSuccessful.length / presetRuns.length) * 100 
        : 0,
    };
  }).filter(s => s.totalRuns > 0);

  const selectedPreset = selectedPresetId
    ? presets.find((p) => p.id === selectedPresetId)
    : null;

  return json({
    runs: filteredRuns,
    progress,
    presets,
    presetStats,
    selectedPresetId,
    selectedPreset,
    stats: {
      totalRuns,
      completedRuns: completedRuns.length,
      successfulRuns: successfulRuns.length,
      fullyCompletedRuns: fullyCompletedRuns.length,
      globalSuccessRate,
      completionRate,
      runsByAscension,
    },
  });
}

export default function Stats() {
  const { runs, progress, presets, presetStats, selectedPresetId, selectedPreset, stats } = 
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePresetChange = (presetId: string) => {
    if (presetId) {
      setSearchParams({ preset: presetId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            Statistiques
          </div>
        }
        description={
          selectedPreset
            ? `Analyse des simulations du preset : ${selectedPreset.name}`
            : "Analyse de toutes les simulations"
        }
      />

      {/* Preset Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtrer par Preset</CardTitle>
          <CardDescription>Sélectionnez un preset pour voir ses statistiques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={!selectedPresetId ? "default" : "outline"}
              onClick={() => handlePresetChange("")}
            >
              Tous les presets
            </Button>
            {presets.map((preset) => (
              <Button
                key={preset.id}
                variant={selectedPresetId === preset.id ? "default" : "outline"}
                onClick={() => handlePresetChange(preset.id)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats par preset */}
      {!selectedPresetId && presetStats.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Comparaison des Presets</CardTitle>
            <CardDescription>Performance de chaque preset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {presetStats.map((stat) => (
                <div key={stat.presetId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{stat.presetName}</div>
                    <div className="text-sm text-muted-foreground">
                      {stat.totalRuns} simulation{stat.totalRuns > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stat.successRate.toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Succès</div>
                    </div>
                    <Link to={`?preset=${stat.presetId}`}>
                      <Button size="sm" variant="outline">
                        Voir détails
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Global Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Simulations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRuns}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Taux de Succès</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {stats.globalSuccessRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Taux de Complétion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {stats.completionRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ascension Max</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {progress?.maxAscensionUnlocked || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Progress */}
        {!selectedPresetId && (
          <Card>
            <CardHeader>
              <CardTitle>Progression du Joueur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground">Ascension Max Débloquée</div>
                  <div className="text-2xl font-bold">{progress?.maxAscensionUnlocked || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Runs Complétées</div>
                  <div className="text-2xl font-bold text-green-500">
                    {progress?.totalRunsCompleted || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Runs Tentées</div>
                  <div className="text-2xl font-bold">{progress?.totalRunsAttempted || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats by Ascension */}
        {Object.keys(stats.runsByAscension).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Statistiques par Ascension
              </CardTitle>
              <CardDescription>
                {selectedPreset 
                  ? `Performance du preset "${selectedPreset.name}" par niveau d'ascension`
                  : "Performance à chaque niveau d'ascension"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.runsByAscension)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([ascension, ascensionRuns]) => {
                    const successful = ascensionRuns.filter((r) => r.successRate > 0);
                    const completed = ascensionRuns.filter((r) => r.completedFully);
                    const successRate =
                      ascensionRuns.length > 0
                        ? (successful.length / ascensionRuns.length) * 100
                        : 0;

                    return (
                      <div key={ascension} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-lg">
                              Ascension {ascension}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {ascensionRuns.length} run(s)
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{successRate.toFixed(0)}%</div>
                            <div className="text-xs text-muted-foreground">Succès</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Réussies: </span>
                            <span className="font-medium">{successful.length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Complétées: </span>
                            <span className="font-medium text-primary">{completed.length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Échouées: </span>
                            <span className="font-medium text-destructive">
                              {ascensionRuns.length - successful.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Runs */}
        <Card>
          <CardHeader>
            <CardTitle>Simulations Récentes</CardTitle>
            <CardDescription>
              {selectedPreset 
                ? `Dernières simulations du preset "${selectedPreset.name}"`
                : "Dernières simulations lancées"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {runs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {selectedPreset 
                  ? `Aucune simulation lancée pour ce preset`
                  : "Aucune simulation lancée pour le moment"}
              </div>
            ) : (
              <div className="space-y-2">
                {runs.slice(0, 10).map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          run.status === "completed"
                            ? "default"
                            : run.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {run.status}
                      </Badge>
                      <div>
                        <div className="font-medium">
                          Ascension {run.ascension} · {run.startLevel} → {run.endLevel}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {run.iterations} run(s) · Succès: {run.successRate.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{run.avgFinalLevel || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        {run.avgTokens.toFixed(0)} jetons
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
