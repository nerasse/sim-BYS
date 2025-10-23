import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState } from "react";
import { getAllSymbols } from "~/db/queries/symbols";
import { getActiveCombinations } from "~/db/queries/combos";
import { getStartingBonuses, getGameBonuses } from "~/db/queries/bonuses";
import { getAllJokers } from "~/db/queries/jokers";
import { getUnlockedCharacters } from "~/db/queries/characters";
import { getPlayerProgress } from "~/db/queries/progress";
import { PageHeader } from "~/components/layout/page-header";
import { Gamepad2, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { runAutoSimulation } from "~/lib/simulation/runners/auto-runner";
import type { SimulationConfig } from "~/lib/simulation/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Simulateur - Simulateur BYS" },
    { name: "description", content: "Lancer une simulation" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const presetId = url.searchParams.get("preset");
  
  const [symbols, combinations, startingBonuses, gameBonuses, jokers, characters, progress] =
    await Promise.all([
      getAllSymbols(),
      getActiveCombinations(),
      getStartingBonuses(),
      getGameBonuses(),
      getAllJokers(),
      getUnlockedCharacters(),
      getPlayerProgress(),
    ]);

  let loadedPreset = null;
  if (presetId) {
    const { getPresetById } = await import("~/db/queries/presets");
    loadedPreset = await getPresetById(presetId);
  }

  return json({
    symbols,
    combinations,
    startingBonuses,
    gameBonuses,
    jokers,
    characters,
    progress,
    loadedPreset,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const configJson = formData.get("config") as string;
  
  if (!configJson) {
    return json({ error: "Missing config" }, { status: 400 });
  }

  const config: SimulationConfig = JSON.parse(configJson);
  
  // Run simulation
  const result = runAutoSimulation(config);
  
  return json({ result });
}

export default function Simulator() {
  const { symbols, combinations, startingBonuses, characters, progress } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]?.id || "");
  const [selectedStartingBonus, setSelectedStartingBonus] = useState(startingBonuses[0]?.id || "");
  const [ascension, setAscension] = useState(0);
  const [startLevel, setStartLevel] = useState("1-1");
  const [endLevel, setEndLevel] = useState("7-3");
  const [startingDollars, setStartingDollars] = useState(10);
  const [iterations, setIterations] = useState(1);

  const handleRunSimulation = () => {
    const character = characters.find((c) => c.id === selectedCharacter);
    const startingBonus = startingBonuses.find((b) => b.id === selectedStartingBonus);

    if (!character || !startingBonus) {
      alert("Veuillez sélectionner un personnage et un bonus de départ");
      return;
    }

    const config: SimulationConfig = {
      character,
      startingBonus,
      symbolsConfig: symbols,
      combosConfig: combinations,
      ascension,
      startLevel,
      endLevel,
      startingDollars,
      mode: "auto",
      iterations,
    };

    fetcher.submit(
      { config: JSON.stringify(config) },
      { method: "post" }
    );
  };

  const isRunning = fetcher.state !== "idle";
  const result = fetcher.data?.result;

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8" />
            Simulateur
          </div>
        }
        description="Configurez et lancez une simulation"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Paramètres de la simulation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Character Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Personnage</label>
                <select
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  {characters.map((char) => (
                    <option key={char.id} value={char.id}>
                      {char.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Starting Bonus */}
              <div>
                <label className="text-sm font-medium mb-2 block">Bonus de Départ</label>
                <select
                  value={selectedStartingBonus}
                  onChange={(e) => setSelectedStartingBonus(e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  {startingBonuses.map((bonus) => (
                    <option key={bonus.id} value={bonus.id}>
                      {bonus.name}
                    </option>
                  ))}
                </select>
              </div>

              <Separator />

              {/* Ascension */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Ascension (Max: {progress?.maxAscensionUnlocked || 0})
                </label>
                <Input
                  type="number"
                  min={0}
                  max={progress?.maxAscensionUnlocked || 0}
                  value={ascension}
                  onChange={(e) => setAscension(Number(e.target.value))}
                />
              </div>

              {/* Levels */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Niveau Début</label>
                  <Input
                    type="text"
                    value={startLevel}
                    onChange={(e) => setStartLevel(e.target.value)}
                    placeholder="1-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Niveau Fin</label>
                  <Input
                    type="text"
                    value={endLevel}
                    onChange={(e) => setEndLevel(e.target.value)}
                    placeholder="7-3"
                  />
                </div>
              </div>

              {/* Starting Dollars */}
              <div>
                <label className="text-sm font-medium mb-2 block">Dollars de Départ</label>
                <Input
                  type="number"
                  min={0}
                  value={startingDollars}
                  onChange={(e) => setStartingDollars(Number(e.target.value))}
                />
              </div>

              {/* Iterations */}
              <div>
                <label className="text-sm font-medium mb-2 block">Nombre de Runs</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Mode batch pour statistiques (max 100)
                </p>
              </div>

              <Separator />

              <Button
                onClick={handleRunSimulation}
                disabled={isRunning}
                className="w-full"
                size="lg"
              >
                {isRunning ? "Simulation en cours..." : "🚀 Lancer la Simulation"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {!result && !isRunning && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <div className="flex justify-center mb-4">
                    <Gamepad2 className="w-24 h-24" />
                  </div>
                  <p>Configurez les paramètres et lancez une simulation</p>
                </div>
              </CardContent>
            </Card>
          )}

          {isRunning && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 animate-pulse">⏳</div>
                  <p className="text-muted-foreground">Simulation en cours...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Résultats de la Simulation</CardTitle>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "✅ Succès" : "❌ Échec"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Niveau Final</div>
                      <div className="text-2xl font-bold">{result.finalLevel}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Jetons Finaux</div>
                      <div className="text-2xl font-bold text-primary">
                        {result.finalTokens.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Dollars Finaux</div>
                      <div className="text-2xl font-bold text-green-500">
                        {result.finalDollars}$
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Niveau Joueur</div>
                      <div className="text-2xl font-bold">{result.finalPlayerLevel}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Durée</div>
                      <div className="text-2xl font-bold">{result.duration}ms</div>
                    </div>
                    {result.completedFully && (
                      <div className="md:col-span-2">
                        <Badge variant="default" className="text-lg py-2 px-4">
                          🏆 RUN COMPLÉTÉE !
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Spins</div>
                      <div className="text-xl font-bold">{result.stats.totalSpins}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Spins Gagnants</div>
                      <div className="text-xl font-bold text-green-500">
                        {result.stats.winningSpins}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Taux de Réussite</div>
                      <div className="text-xl font-bold">
                        {((result.stats.winningSpins / result.stats.totalSpins) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Combos</div>
                      <div className="text-xl font-bold">{result.stats.totalCombos}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Jetons/Spin (moy)</div>
                      <div className="text-xl font-bold">
                        {result.stats.averageTokensPerSpin.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Max en 1 Spin</div>
                      <div className="text-xl font-bold text-primary">
                        {result.stats.maxTokensInSingleSpin.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {Object.keys(result.stats.comboFrequency).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>🎯 Fréquence des Combos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(result.stats.comboFrequency)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([combo, count]) => (
                          <div key={combo} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{combo}</span>
                            <Badge variant="secondary">{count} fois</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

