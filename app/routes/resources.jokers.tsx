import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getAllJokers, createJoker, updateJoker, deleteJoker } from "~/db/queries/jokers";
import { getAllEffects } from "~/db/queries/effects";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { EffectSelector } from "~/components/effects/effect-selector";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Jokers - Ressources - Simulateur BYS" },
    { name: "description", content: "Bibliothèque globale des jokers" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const [jokers, effects] = await Promise.all([
    getAllJokers(),
    getAllEffects(),
  ]);
  return json({ jokers, effects });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create" || intent === "update") {
    const effectsJSON = formData.get("effects") as string;
    const tagsJSON = formData.get("tags") as string;
    let effects = [];
    let tags = [];
    try {
      effects = JSON.parse(effectsJSON || '[]');
      tags = JSON.parse(tagsJSON || '[]');
    } catch (e) {
      return json({ success: false, error: "Invalid JSON" });
    }

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      rarity: formData.get("rarity") as "common" | "uncommon" | "rare" | "epic" | "legendary",
      basePrice: parseInt(formData.get("basePrice") as string),
      effects,
      tags,
      sellValue: parseInt(formData.get("sellValue") as string),
    };

    if (intent === "create") {
      await createJoker(data);
    } else {
      await updateJoker(formData.get("id") as string, data);
    }

    return json({ success: true });
  }

  if (intent === "delete") {
    await deleteJoker(formData.get("id") as string);
    return json({ success: true });
  }

  return json({ success: false });
}

const rarityColors: Record<string, string> = {
  common: "bg-gray-500",
  uncommon: "bg-green-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-orange-500",
};

export default function ResourcesJokers() {
  const { jokers, effects } = useLoaderData<typeof loader>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Jokers"
          description="Bibliothèque globale des jokers disponibles dans le jeu"
        />
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {showCreateForm && (
        <JokerForm
          effects={effects}
          onCancel={() => setShowCreateForm(false)}
          intent="create"
        />
      )}

      <div className="border rounded-lg divide-y">
        {jokers.map((joker) => (
          <div key={joker.id}>
            {editingId === joker.id ? (
              <JokerForm
                effects={effects}
                joker={joker}
                onCancel={() => setEditingId(null)}
                intent="update"
              />
            ) : (
              <JokerListItem joker={joker} onEdit={() => setEditingId(joker.id)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function JokerListItem({ joker, onEdit }: { joker: any; onEdit: () => void }) {
  const fetcher = useFetcher();

  const handleDelete = () => {
    if (confirm(`Supprimer le joker "${joker.name}" ?`)) {
      fetcher.submit({ intent: "delete", id: joker.id }, { method: "post" });
    }
  };

  return (
    <div className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">{joker.name}</h3>
            <Badge className={rarityColors[joker.rarity]}>{joker.rarity}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mb-3">{joker.description}</p>
          <div className="flex gap-6 text-sm mb-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Prix:</span>
              <span className="font-medium">{joker.basePrice}$</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Vente:</span>
              <span className="font-medium">{joker.sellValue}$</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Effets:</span>
              <span className="font-medium">{joker.effects.length}</span>
            </div>
          </div>
          {joker.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {joker.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
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

function JokerForm({
  effects: availableEffects,
  joker,
  onCancel,
  intent,
}: {
  effects: any[];
  joker?: any;
  onCancel: () => void;
  intent: "create" | "update";
}) {
  const fetcher = useFetcher();
  const [selectedEffects, setSelectedEffects] = useState(joker?.effects || []);
  const [tags, setTags] = useState((joker?.tags || []).join(", "));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intent === "create" ? "Nouveau joker" : "Modifier"}</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form
          method="post"
          className="space-y-4"
          onSubmit={(e) => {
            const form = e.currentTarget;
            const effectsInput = document.createElement("input");
            effectsInput.type = "hidden";
            effectsInput.name = "effects";
            effectsInput.value = JSON.stringify(selectedEffects);
            form.appendChild(effectsInput);
            
            const tagsInput = document.createElement("input");
            tagsInput.type = "hidden";
            tagsInput.name = "tags";
            tagsInput.value = JSON.stringify(tags.split(",").map(t => t.trim()).filter(Boolean));
            form.appendChild(tagsInput);
            
            setTimeout(onCancel, 100);
          }}
        >
          <input type="hidden" name="intent" value={intent} />
          {intent === "update" && <input type="hidden" name="id" value={joker?.id} />}

          <div className="space-y-2">
            <Label>Nom</Label>
            <Input name="name" defaultValue={joker?.name} required />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input name="description" defaultValue={joker?.description} required />
          </div>

          <div className="space-y-2">
            <Label>Rareté</Label>
            <select
              name="rarity"
              defaultValue={joker?.rarity || "common"}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Prix de base</Label>
              <Input
                name="basePrice"
                type="number"
                defaultValue={joker?.basePrice || 0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Valeur vente</Label>
              <Input
                name="sellValue"
                type="number"
                defaultValue={joker?.sellValue || 0}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Effets</Label>
            <EffectSelector
              availableEffects={availableEffects}
              initialEffects={selectedEffects}
              onChange={setSelectedEffects}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags (séparés par virgule)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="rare, multiplicateur, score"
            />
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
