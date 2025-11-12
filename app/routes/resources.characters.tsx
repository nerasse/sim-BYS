import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getAllCharacters, createCharacter, updateCharacter, deleteCharacter } from "~/db/queries/characters";
import { getAllEffects } from "~/db/queries/effects";
import { getAllBonuses } from "~/db/queries/bonuses";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import React, { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Personnages - Ressources - Simulateur BYS" },
    { name: "description", content: "Bibliothèque globale des personnages" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const [characters, effects, bonuses] = await Promise.all([
    getAllCharacters(),
    getAllEffects(),
    getAllBonuses(),
  ]);
  return json({ characters, effects, bonuses });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create" || intent === "update") {
    const passiveEffectsJSON = formData.get("passiveEffects") as string;
    const startingBonusesJSON = formData.get("startingBonuses") as string;
    
    let passiveEffects = [];
    let startingBonuses = [];
    
    try {
      passiveEffects = JSON.parse(passiveEffectsJSON || '[]');
      startingBonuses = JSON.parse(startingBonusesJSON || '[]');
    } catch (e) {
      return json({ success: false, error: "Invalid JSON" });
    }

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      passiveEffects,
      startingBonuses,
      baseStats: {
        chance: parseFloat(formData.get("baseStatsChance") as string) || undefined,
        multiplier: parseFloat(formData.get("baseStatsMultiplier") as string) || undefined,
      },
      scalingPerLevel: {
        chance: parseFloat(formData.get("scalingChance") as string) || undefined,
        multiplier: parseFloat(formData.get("scalingMultiplier") as string) || undefined,
      },
    };

    if (intent === "create") {
      await createCharacter(data);
    } else {
      await updateCharacter(formData.get("id") as string, data);
    }

    return json({ success: true });
  }

  if (intent === "delete") {
    await deleteCharacter(formData.get("id") as string);
    return json({ success: true });
  }

  return json({ success: false });
}

export default function ResourcesCharacters() {
  const { characters, effects, bonuses } = useLoaderData<typeof loader>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Personnages"
          description="Bibliothèque globale des personnages disponibles dans le jeu"
        />
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {showCreateForm && (
        <CharacterForm
          effects={effects}
          bonuses={bonuses}
          onCancel={() => setShowCreateForm(false)}
          intent="create"
        />
      )}

      <div className="border rounded-lg divide-y">
        {characters.map((character) => (
          <div key={character.id}>
            {editingId === character.id ? (
              <CharacterForm
                effects={effects}
                bonuses={bonuses}
                character={character}
                onCancel={() => setEditingId(null)}
                intent="update"
              />
            ) : (
              <CharacterListItem
                character={character}
                effects={effects}
                bonuses={bonuses}
                onEdit={() => setEditingId(character.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CharacterListItem({ character, onEdit, effects, bonuses }: { character: any; onEdit: () => void; effects: any[]; bonuses: any[] }) {
  const fetcher = useFetcher();

  const handleDelete = () => {
    if (confirm(`Supprimer le personnage "${character.name}" ?`)) {
      fetcher.submit({ intent: "delete", id: character.id }, { method: "post" });
    }
  };

  // Gestion rétrocompatibilité ancien format
  const passiveEffects = character.passiveEffects || (character.passiveEffect ? [character.passiveEffect] : []);
  const startingBonuses = character.startingBonuses || (character.startingBonus ? [character.startingBonus] : []);

  return (
    <div className="p-6 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-xl mb-3">{character.name}</h3>
          <p className="text-muted-foreground mb-4 leading-relaxed">{character.description}</p>
          
          <div className="space-y-4">
            {/* Effets passifs */}
            {passiveEffects.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Effets passifs</div>
                <div className="flex flex-wrap gap-2">
                  {passiveEffects.map((effect: any, idx: number) => {
                    const effectData = effects.find(e => e.name === effect.type);
                    return (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {effectData?.icon} {effectData?.displayName || effect.type} <span className="text-primary ml-1">({effect.value})</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Bonus de départ */}
            {startingBonuses.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Bonus de départ</div>
                <div className="flex flex-wrap gap-2">
                  {startingBonuses.map((bonusId: string, idx: number) => {
                    const bonusData = bonuses.find(b => b.id === bonusId);
                    return (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {bonusData?.name || bonusId}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Stats de base */}
            {(character.baseStats?.chance || character.baseStats?.multiplier) && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Stats de base</div>
                <div className="font-medium text-sm">
                  {character.baseStats.chance && `Chance: ${character.baseStats.chance}`}
                  {character.baseStats.chance && character.baseStats.multiplier && " • "}
                  {character.baseStats.multiplier && `Mult: ${character.baseStats.multiplier}`}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit2 className="w-3 h-3 mr-1" />
            Modifier
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={fetcher.state !== "idle"}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CharacterForm({
  effects: availableEffects,
  bonuses: availableBonuses,
  character,
  onCancel,
  intent,
}: {
  effects: any[];
  bonuses: any[];
  character?: any;
  onCancel: () => void;
  intent: "create" | "update";
}) {
  const fetcher = useFetcher();
  
  // Gestion rétrocompatibilité
  const initialPassiveEffects = character?.passiveEffects || (character?.passiveEffect ? [character.passiveEffect] : []);
  const initialStartingBonuses = character?.startingBonuses || (character?.startingBonus ? [character.startingBonus] : []);
  
  const [passiveEffects, setPassiveEffects] = useState<Array<{type: string, value: number}>>(initialPassiveEffects);
  const [startingBonuses, setStartingBonuses] = useState<string[]>(initialStartingBonuses);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("passiveEffects", JSON.stringify(passiveEffects));
    formData.set("startingBonuses", JSON.stringify(startingBonuses));
    fetcher.submit(formData, { method: "post" });
    setTimeout(onCancel, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intent === "create" ? "Nouveau personnage" : "Modifier"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="intent" value={intent} />
          {intent === "update" && <input type="hidden" name="id" value={character?.id} />}

          <div className="space-y-2">
            <Label>Nom</Label>
            <Input name="name" defaultValue={character?.name} required />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input name="description" defaultValue={character?.description} required />
          </div>

          {/* Effets passifs */}
          <div className="border p-4 rounded space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Effets passifs</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPassiveEffects([...passiveEffects, { type: availableEffects[0]?.name || "", value: 1 }])}
              >
                <Plus className="w-3 h-3 mr-1" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {passiveEffects.map((effect, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Effet</Label>
                    <select
                      value={effect.type}
                      onChange={(e) => {
                        const newEffects = [...passiveEffects];
                        newEffects[idx].type = e.target.value;
                        setPassiveEffects(newEffects);
                      }}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      {availableEffects.map((eff) => (
                        <option key={eff.id} value={eff.name}>
                          {eff.icon ? `${eff.icon} ` : ""}{eff.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Valeur</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={effect.value}
                      onChange={(e) => {
                        const newEffects = [...passiveEffects];
                        newEffects[idx].value = parseFloat(e.target.value) || 0;
                        setPassiveEffects(newEffects);
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setPassiveEffects(passiveEffects.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {passiveEffects.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun effet passif</p>
              )}
            </div>
          </div>

          {/* Bonus de départ */}
          <div className="border p-4 rounded space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Bonus de départ</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setStartingBonuses([...startingBonuses, availableBonuses[0]?.id || ""])}
              >
                <Plus className="w-3 h-3 mr-1" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {startingBonuses.map((bonusId, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Bonus</Label>
                    <select
                      value={bonusId}
                      onChange={(e) => {
                        const newBonuses = [...startingBonuses];
                        newBonuses[idx] = e.target.value;
                        setStartingBonuses(newBonuses);
                      }}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      {availableBonuses.map((bonus) => (
                        <option key={bonus.id} value={bonus.id}>
                          {bonus.name} ({bonus.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setStartingBonuses(startingBonuses.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {startingBonuses.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun bonus de départ</p>
              )}
            </div>
          </div>

          <div className="border p-3 rounded space-y-2">
            <Label className="text-sm font-semibold">Stats de base</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Chance</Label>
                <Input
                  name="baseStatsChance"
                  type="number"
                  step="0.01"
                  defaultValue={character?.baseStats?.chance}
                />
              </div>
              <div>
                <Label className="text-xs">Multiplicateur</Label>
                <Input
                  name="baseStatsMultiplier"
                  type="number"
                  step="0.1"
                  defaultValue={character?.baseStats?.multiplier}
                />
              </div>
            </div>
          </div>

          <div className="border p-3 rounded space-y-2">
            <Label className="text-sm font-semibold">Scaling par niveau</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Chance</Label>
                <Input
                  name="scalingChance"
                  type="number"
                  step="0.01"
                  defaultValue={character?.scalingPerLevel?.chance}
                />
              </div>
              <div>
                <Label className="text-xs">Multiplicateur</Label>
                <Input
                  name="scalingMultiplier"
                  type="number"
                  step="0.1"
                  defaultValue={character?.scalingPerLevel?.multiplier}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={fetcher.state !== "idle"} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
