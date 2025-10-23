import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { PageHeader } from "~/components/layout/page-header";
import { getPlayerProgress } from "~/db/queries/progress";
import { getAllSimulationRuns } from "~/db/queries/simulations";
import { LayoutDashboard, Settings, Gamepad2, TrendingUp, Play, CheckCircle2, Clock, Save } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - Simulateur BYS" },
    { name: "description", content: "Simulateur de machine à sous roguelike" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const [progress, runs] = await Promise.all([
    getPlayerProgress(),
    getAllSimulationRuns(),
  ]);

  const recentRuns = runs.slice(0, 5);
  const completedRuns = runs.filter((r) => r.status === "completed");

  return json({
    progress,
    totalRuns: runs.length,
    completedRuns: completedRuns.length,
    recentRuns,
  });
}

export default function Index() {
  const { progress, totalRuns, completedRuns, recentRuns } = useLoaderData<typeof loader>();

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8" />
            Dashboard
          </div>
        }
        description="Bienvenue dans le simulateur BYS"
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ascension Max</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {progress?.maxAscensionUnlocked || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Simulations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRuns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Complétées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {completedRuns}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taux Succès</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalRuns > 0 ? ((completedRuns / totalRuns) * 100).toFixed(0) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Symboles, combos, bonus et jokers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/config/symbols">
              <Button className="w-full">Configurer</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              Simulateur
            </CardTitle>
            <CardDescription>
              Lancer une nouvelle simulation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/simulator">
              <Button className="w-full" variant="default">
                Simuler
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Statistiques
            </CardTitle>
            <CardDescription>
              Analyser les performances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/stats">
              <Button className="w-full" variant="outline">
                Consulter
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Save className="w-5 h-5" />
              Presets
            </CardTitle>
            <CardDescription>
              Configurations sauvegardées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/presets">
              <Button className="w-full" variant="outline">
                Gérer
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Runs */}
      {recentRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🕐 Simulations Récentes</CardTitle>
            <CardDescription>Dernières simulations lancées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
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
                        Ascension {run.ascension} · {run.mode}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {run.startLevel} → {run.endLevel} · {run.iterations} run(s)
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {run.successRate.toFixed(0)}% succès
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {run.avgTokens.toFixed(0)} jetons
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      {totalRuns === 0 && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>🚀 Commencer</CardTitle>
            <CardDescription>
              Prêt à lancer votre première simulation ?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                1. Explorez la configuration pour comprendre les symboles et combos
                <br />
                2. Lancez une simulation avec les paramètres par défaut
                <br />
                3. Analysez les résultats et affinez votre stratégie
              </p>
              <Link to="/simulator">
                <Button size="lg" className="w-full flex items-center gap-2 justify-center">
                  <Play className="w-5 h-5" />
                  Lancer ma première simulation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

