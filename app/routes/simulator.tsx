import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { useState } from "react";
import { requireActivePreset } from "~/lib/utils/require-active-preset";
import { getPresetById } from "~/db/queries/presets";
import { getPresetSymbolConfigs } from "~/db/queries/preset-symbol-configs";
import { getPresetComboConfigs } from "~/db/queries/preset-combo-configs";
import { getPresetLevelConfigs } from "~/db/queries/preset-level-configs";
import { getPresetShopRarityConfigs } from "~/db/queries/preset-shop-rarity-configs";
import { getStartingBonuses, getGameBonuses } from "~/db/queries/bonuses";
import { getAllJokers } from "~/db/queries/jokers";
import { getUnlockedCharacters } from "~/db/queries/characters";
import { getPlayerProgress } from "~/db/queries/progress";
import { PageHeader } from "~/components/layout/page-header";
import { Gamepad2, Settings } from "lucide-react";
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
  const activePresetId = await requireActivePreset();
  
  const [
    preset,
    symbolConfigs,
    comboConfigs,
    levelConfigs,
    shopRarityConfigs,
    startingBonuses,
    gameBonuses,
    jokers,
    characters,
    progress
  ] = await Promise.all([
    getPresetById(activePresetId),
    getPresetSymbolConfigs(activePresetId),
    getPresetComboConfigs(activePresetId),
    getPresetLevelConfigs(activePresetId),
    getPresetShopRarityConfigs(activePresetId),
    getStartingBonuses(),
    getGameBonuses(),
    getAllJokers(),
    getUnlockedCharacters(),
    getPlayerProgress(),
  ]);

  return json({
    preset,
    symbolConfigs,
    comboConfigs,
    levelConfigs,
    shopRarityConfigs,
    startingBonuses,
    gameBonuses,
    jokers,
    characters,
    progress,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const activePresetId = await requireActivePreset();
  const formData = await request.formData();
  const configJson = formData.get("config") as string;
  
  if (!configJson) {
    return json({ error: "Missing config" }, { status: 400 });
  }

  const config: SimulationConfig = JSON.parse(configJson);
  
  // Run simulation
  const result = runAutoSimulation(config);
  
  // TODO: Save simulation run with presetId
  
  return json({ result, presetId: activePresetId });
}

export default function Simulator() {
  const { preset, symbolConfigs, comboConfigs, startingBonuses, characters } =
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

    // Préparer les configs depuis le preset
    const symbolWeights: Record<string, number> = {};
    symbolConfigs.forEach(({ config, symbol }) => {
      if (symbol) {
        symbolWeights[symbol.id] = config.weight;
      }
    });

    const comboMultipliers: Record<string, number> = {};
    comboConfigs.forEach(({ config, combo }) => {
      if (combo && config.isActive) {
        comboMultipliers[combo.id] = config.multiplier;
      }
    });

    const config: SimulationConfig = {
      character,
      startingBonus,
      symbolWeights,
      comboMultipliers,
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
        description={
          <div className="flex items-center gap-2">
            Simulation avec le preset : <Badge variant="outline">{preset?.name}</Badge>
          </div>
        }
        actions={
          <Link to="/config">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configurer
            </Button>
          </Link>
        }
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

              {/* Starting Bonus Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Bonus de départ</label>
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
                  Ascension: {ascension}
                </label>
                <Input
                  type="range"
                  min="0"
                  max="20"
                  value={ascension}
                  onChange={(e) => setAscension(parseInt(e.target.value))}
                />
              </div>

              {/* Start Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">Niveau de départ</label>
                <Input
                  type="text"
                  value={startLevel}
                  onChange={(e) => setStartLevel(e.target.value)}
                  placeholder="1-1"
                />
              </div>

              {/* End Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">Niveau de fin</label>
                <Input
                  type="text"
                  value={endLevel}
                  onChange={(e) => setEndLevel(e.target.value)}
                  placeholder="7-3"
                />
              </div>

              {/* Starting Dollars */}
              <div>
                <label className="text-sm font-medium mb-2 block">Dollars de départ</label>
                <Input
                  type="number"
                  value={startingDollars}
                  onChange={(e) => setStartingDollars(parseInt(e.target.value))}
                />
              </div>

              <Separator />

              {/* Iterations */}
              <div>
                <label className="text-sm font-medium mb-2 block">Itérations</label>
                <Input
                  type="number"
                  min="1"
                  max="10000"
                  value={iterations}
                  onChange={(e) => setIterations(parseInt(e.target.value))}
                />
              </div>

              {/* Run Button */}
              <Button
                onClick={handleRunSimulation}
                disabled={isRunning}
                className="w-full"
                size="lg"
              >
                {isRunning ? "Simulation en cours..." : "Lancer la simulation"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Résultats</CardTitle>
              <CardDescription>
                {isRunning
                  ? "Simulation en cours..."
                  : result
                  ? "Simulation terminée"
                  : "Aucune simulation lancée"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={result.success ? "default" : "destructive"}
                      className="text-lg px-4 py-2"
                    >
                      {result.success ? "✓ Succès" : "✗ Échec"}
                    </Badge>
                    {result.completedFully && (
                      <Badge variant="outline">Complété à 100%</Badge>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Niveau final</div>
                      <div className="text-2xl font-bold">{result.finalLevel}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Jetons totaux</div>
                      <div className="text-2xl font-bold">{result.totalTokens}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Dollars finaux</div>
                      <div className="text-2xl font-bold">${result.totalDollars}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Jokers achetés</div>
                      <div className="text-2xl font-bold">
                        {result.decisions?.jokersPurchased?.length || 0}
                      </div>
                    </div>
                  </div>

                  {result.stats && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm font-medium mb-2">Statistiques</div>
                        <div className="text-sm space-y-1">
                          <div>Spins totaux: {result.stats.totalSpins}</div>
                          <div>Combos détectés: {result.stats.totalCombosDetected}</div>
                          <div>
                            Taux de succès: {result.stats.winRate?.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Configurez les paramètres et lancez une simulation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

