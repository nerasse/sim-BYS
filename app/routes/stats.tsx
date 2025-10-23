import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllSimulationRuns } from "~/db/queries/simulations";
import { getPlayerProgress } from "~/db/queries/progress";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { BarChart3 } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Statistiques - Simulateur BYS" },
    { name: "description", content: "Statistiques globales et méta-analyse" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const [runs, progress] = await Promise.all([
    getAllSimulationRuns(),
    getPlayerProgress(),
  ]);

  // Calculate global stats
  const totalRuns = runs.length;
  const completedRuns = runs.filter((r) => r.status === "completed");
  const successfulRuns = completedRuns.filter((r) => r.successRate > 0);
  const fullyCompletedRuns = completedRuns.filter((r) => r.completedFully);

  const globalSuccessRate =
    totalRuns > 0 ? (successfulRuns.length / totalRuns) * 100 : 0;
  const completionRate =
    totalRuns > 0 ? (fullyCompletedRuns.length / totalRuns) * 100 : 0;

  // Stats by ascension
  const runsByAscension: Record<number, typeof runs> = {};
  for (const run of runs) {
    if (!runsByAscension[run.ascension]) {
      runsByAscension[run.ascension] = [];
    }
    runsByAscension[run.ascension].push(run);
  }

  return json({
    runs,
    progress,
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
  const { runs, progress, stats } = useLoaderData<typeof loader>();

  return (
    <div>
      <PageHeader
        title="📈 Statistiques"
        description="Méta-analyse de toutes les simulations"
      />

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
        <Card>
          <CardHeader>
            <CardTitle>🎮 Progression du Joueur</CardTitle>
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

        {/* Stats by Ascension */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Statistiques par Ascension
            </CardTitle>
            <CardDescription>Performance à chaque niveau d'ascension</CardDescription>
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

        {/* Recent Runs */}
        <Card>
          <CardHeader>
            <CardTitle>🕐 Simulations Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {runs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Aucune simulation lancée pour le moment
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

