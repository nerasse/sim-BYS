import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getAllBonuses, createBonus, updateBonus, deleteBonus } from "~/db/queries/bonuses";
import { getAllEffects } from "~/db/queries/effects";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { EffectSelector } from "~/components/effects/effect-selector";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Bonus - Ressources - Simulateur BYS" },
    { name: "description", content: "Bibliothèque globale des bonus" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const [bonuses, effects] = await Promise.all([
    getAllBonuses(),
    getAllEffects(),
  ]);
  return json({ bonuses, effects });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create" || intent === "update") {
    const effectsJSON = formData.get("effects") as string;
    let effects = [];
    try {
      effects = JSON.parse(effectsJSON || '[]');
    } catch (e) {
      return json({ success: false, error: "Invalid effects JSON" });
    }

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as "starting" | "game",
      rarity: formData.get("rarity") as "common" | "uncommon" | "rare" | "epic" | "legendary",
      effects,
      isDestructible: formData.get("isDestructible") === "true",
    };

    if (intent === "create") {
      await createBonus(data);
    } else {
      await updateBonus(formData.get("id") as string, data);
    }

    return json({ success: true });
  }

  if (intent === "delete") {
    await deleteBonus(formData.get("id") as string);
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

export default function ResourcesBonuses() {
  const { bonuses, effects } = useLoaderData<typeof loader>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Bonus"
          description="Bibliothèque globale des bonus disponibles dans le jeu"
        />
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {showCreateForm && (
        <BonusForm
          effects={effects}
          onCancel={() => setShowCreateForm(false)}
          intent="create"
        />
      )}

      <div className="border rounded-lg divide-y">
        {bonuses.map((bonus) => (
          <div key={bonus.id}>
            {editingId === bonus.id ? (
              <BonusForm
                effects={effects}
                bonus={bonus}
                onCancel={() => setEditingId(null)}
                intent="update"
              />
            ) : (
              <BonusListItem bonus={bonus} onEdit={() => setEditingId(bonus.id)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BonusListItem({ bonus, onEdit }: { bonus: any; onEdit: () => void }) {
  const fetcher = useFetcher();

  const handleDelete = () => {
    if (confirm(`Supprimer le bonus "${bonus.name}" ?`)) {
      fetcher.submit({ intent: "delete", id: bonus.id }, { method: "post" });
    }
  };

  return (
    <div className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">{bonus.name}</h3>
            <Badge className={rarityColors[bonus.rarity]}>{bonus.rarity}</Badge>
            <Badge variant={bonus.type === "starting" ? "default" : "secondary"}>
              {bonus.type}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mb-3">{bonus.description}</p>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Effets:</span>
              <span className="font-medium">{bonus.effects.length}</span>
            </div>
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

function BonusForm({
  effects: availableEffects,
  bonus,
  onCancel,
  intent,
}: {
  effects: any[];
  bonus?: any;
  onCancel: () => void;
  intent: "create" | "update";
}) {
  const fetcher = useFetcher();
  const [isDestructible, setIsDestructible] = useState(bonus?.isDestructible ?? false);
  const [selectedEffects, setSelectedEffects] = useState(bonus?.effects || []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intent === "create" ? "Nouveau bonus" : "Modifier"}</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form
          method="post"
          className="space-y-4"
          onSubmit={(e) => {
            // Inject effects as JSON
            const form = e.currentTarget;
            const effectsInput = document.createElement("input");
            effectsInput.type = "hidden";
            effectsInput.name = "effects";
            effectsInput.value = JSON.stringify(selectedEffects);
            form.appendChild(effectsInput);
            setTimeout(onCancel, 100);
          }}
        >
          <input type="hidden" name="intent" value={intent} />
          {intent === "update" && <input type="hidden" name="id" value={bonus?.id} />}
          <input type="hidden" name="isDestructible" value={String(isDestructible)} />

          <div className="space-y-2">
            <Label>Nom</Label>
            <Input name="name" defaultValue={bonus?.name} required />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input name="description" defaultValue={bonus?.description} required />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                name="type"
                defaultValue={bonus?.type || "game"}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="starting">Starting</option>
                <option value="game">Game</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Rareté</Label>
              <select
                name="rarity"
                defaultValue={bonus?.rarity || "common"}
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
          </div>

          <div className="space-y-2">
            <Label>Effets</Label>
            <EffectSelector
              availableEffects={availableEffects}
              initialEffects={selectedEffects}
              onChange={setSelectedEffects}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDestructible"
              checked={isDestructible}
              onCheckedChange={(checked) => setIsDestructible(checked as boolean)}
            />
            <Label htmlFor="isDestructible">Destructible</Label>
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
