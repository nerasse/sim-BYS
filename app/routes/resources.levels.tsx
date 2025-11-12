import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getAllLevelConfigs, createLevelConfig, updateLevelConfig, deleteLevelConfig } from "~/db/queries/level-configs";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Plus, Edit2, Trash2, Save, X, Crown } from "lucide-react";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Niveaux - Ressources - Simulateur BYS" },
    { name: "description", content: "Bibliothèque globale des configurations de niveaux" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const levels = await getAllLevelConfigs();
  return json({ levels });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    await createLevelConfig({
      world: parseInt(formData.get("world") as string),
      stage: parseInt(formData.get("stage") as string),
      baseObjective: parseInt(formData.get("baseObjective") as string),
      dollarReward: parseInt(formData.get("dollarReward") as string),
      isBoss: formData.get("isBoss") === "true",
    });
    return json({ success: true });
  }

  if (intent === "update") {
    await updateLevelConfig(formData.get("id") as string, {
      world: parseInt(formData.get("world") as string),
      stage: parseInt(formData.get("stage") as string),
      baseObjective: parseInt(formData.get("baseObjective") as string),
      dollarReward: parseInt(formData.get("dollarReward") as string),
      isBoss: formData.get("isBoss") === "true",
    });
    return json({ success: true });
  }

  if (intent === "delete") {
    await deleteLevelConfig(formData.get("id") as string);
    return json({ success: true });
  }

  return json({ success: false });
}

export default function ResourcesLevels() {
  const { levels } = useLoaderData<typeof loader>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Niveaux"
          description="Bibliothèque globale des configurations de niveaux du jeu"
        />
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {showCreateForm && (
        <LevelForm onCancel={() => setShowCreateForm(false)} intent="create" />
      )}

      <div className="border rounded-lg divide-y">
        {levels
          .sort((a, b) => {
            if (a.world !== b.world) return a.world - b.world;
            return a.stage - b.stage;
          })
          .map((level) => (
            <div key={level.id}>
              {editingId === level.id ? (
                <LevelForm
                  level={level}
                  onCancel={() => setEditingId(null)}
                  intent="update"
                />
              ) : (
                <LevelListItem level={level} onEdit={() => setEditingId(level.id)} />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

function LevelListItem({ level, onEdit }: { level: any; onEdit: () => void }) {
  const fetcher = useFetcher();

  const handleDelete = () => {
    if (confirm(`Supprimer le niveau ${level.levelId} ?`)) {
      fetcher.submit({ intent: "delete", id: level.id }, { method: "post" });
    }
  };

  return (
    <div className={`p-4 hover:bg-accent/50 transition-colors ${level.isBoss ? "bg-yellow-50/50 dark:bg-yellow-950/20" : ""}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">{level.levelId}</h3>
            {level.isBoss && (
              <Badge className="bg-yellow-500">
                <Crown className="w-3 h-3 mr-1" />
                Boss
              </Badge>
            )}
          </div>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Objectif:</span>
              <span className="font-medium">{level.baseObjective?.toLocaleString() || 0} jetons</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Récompense:</span>
              <span className="font-medium">{level.dollarReward || 0}$</span>
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

function LevelForm({
  level,
  onCancel,
  intent,
}: {
  level?: any;
  onCancel: () => void;
  intent: "create" | "update";
}) {
  const fetcher = useFetcher();
  const [isBoss, setIsBoss] = useState(level?.isBoss ?? false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intent === "create" ? "Nouveau niveau" : "Modifier"}</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form
          method="post"
          className="space-y-4"
          onSubmit={() => setTimeout(onCancel, 100)}
        >
          <input type="hidden" name="intent" value={intent} />
          {intent === "update" && <input type="hidden" name="id" value={level?.id} />}
          <input type="hidden" name="isBoss" value={String(isBoss)} />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Monde</Label>
              <Input
                name="world"
                type="number"
                defaultValue={level?.world || 1}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Input
                name="stage"
                type="number"
                defaultValue={level?.stage || 1}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Objectif (jetons)</Label>
            <Input
              name="baseObjective"
              type="number"
              defaultValue={level?.baseObjective || 1000}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Récompense ($)</Label>
            <Input
              name="dollarReward"
              type="number"
              defaultValue={level?.dollarReward || 50}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isBoss"
              checked={isBoss}
              onCheckedChange={(checked) => setIsBoss(checked as boolean)}
            />
            <Label htmlFor="isBoss" className="flex items-center">
              <Crown className="w-4 h-4 mr-1" />
              Niveau Boss
            </Label>
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
