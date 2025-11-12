import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getAllCharacters, createCharacter, updateCharacter, deleteCharacter } from "~/db/queries/characters";
import { getAllEffects } from "~/db/queries/effects";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Personnages - Ressources - Simulateur BYS" },
    { name: "description", content: "Bibliothèque globale des personnages" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const [characters, effects] = await Promise.all([
    getAllCharacters(),
    getAllEffects(),
  ]);
  return json({ characters, effects });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create" || intent === "update") {
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      passiveEffect: {
        type: formData.get("passiveEffectType") as string,
        value: parseFloat(formData.get("passiveEffectValue") as string),
      },
      startingBonus: formData.get("startingBonus") as string,
      baseStats: {
        chance: parseFloat(formData.get("baseStatsChance") as string) || undefined,
        multiplier: parseFloat(formData.get("baseStatsMultiplier") as string) || undefined,
      },
      scalingPerLevel: {
        chance: parseFloat(formData.get("scalingChance") as string) || undefined,
        multiplier: parseFloat(formData.get("scalingMultiplier") as string) || undefined,
      },
      unlockCondition: formData.get("unlockCondition") as string || undefined,
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
  const { characters, effects } = useLoaderData<typeof loader>();
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
          onCancel={() => setShowCreateForm(false)}
          intent="create"
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <div key={character.id}>
            {editingId === character.id ? (
              <CharacterForm
                effects={effects}
                character={character}
                onCancel={() => setEditingId(null)}
                intent="update"
              />
            ) : (
              <CharacterCard
                character={character}
                onEdit={() => setEditingId(character.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CharacterCard({ character, onEdit }: { character: any; onEdit: () => void }) {
  const fetcher = useFetcher();

  const handleDelete = () => {
    if (confirm(`Supprimer le personnage "${character.name}" ?`)) {
      fetcher.submit({ intent: "delete", id: character.id }, { method: "post" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{character.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground text-xs mb-2">{character.description}</p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Effet passif:</span>
            <span className="font-medium text-xs">
              {character.passiveEffect.type} ({character.passiveEffect.value})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bonus départ:</span>
            <span className="font-medium text-xs">{character.startingBonus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stats de base:</span>
            <span className="font-medium text-xs">
              {character.baseStats.chance && `Chance: ${character.baseStats.chance}`}
              {character.baseStats.chance && character.baseStats.multiplier && ", "}
              {character.baseStats.multiplier && `Mult: ${character.baseStats.multiplier}`}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={onEdit} className="flex-1">
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
      </CardContent>
    </Card>
  );
}

function CharacterForm({
  effects: availableEffects,
  character,
  onCancel,
  intent,
}: {
  effects: any[];
  character?: any;
  onCancel: () => void;
  intent: "create" | "update";
}) {
  const fetcher = useFetcher();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intent === "create" ? "Nouveau personnage" : "Modifier"}</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form
          method="post"
          className="space-y-4"
          onSubmit={() => setTimeout(onCancel, 100)}
        >
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

          <div className="border p-3 rounded space-y-2">
            <Label className="text-sm font-semibold">Effet passif</Label>
            <div className="space-y-2">
              <Label className="text-xs">Type d'effet</Label>
              <select
                name="passiveEffectType"
                defaultValue={character?.passiveEffect?.type}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                {availableEffects.map((effect) => (
                  <option key={effect.id} value={effect.name}>
                    {effect.icon ? `${effect.icon} ` : ""}{effect.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Valeur</Label>
              <Input
                name="passiveEffectValue"
                type="number"
                step="0.01"
                defaultValue={character?.passiveEffect?.value || 1}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bonus de départ (ID)</Label>
            <Input name="startingBonus" defaultValue={character?.startingBonus} required />
            <p className="text-xs text-muted-foreground">ID du bonus de départ</p>
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

          <div className="space-y-2">
            <Label>Condition de déblocage (optionnel)</Label>
            <Input name="unlockCondition" defaultValue={character?.unlockCondition || ""} />
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
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}
