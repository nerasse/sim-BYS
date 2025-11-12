import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getAllCombinations, createCombination, updateCombination, deleteCombination } from "~/db/queries/combos";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Combinaisons - Ressources - Simulateur BYS" },
    { name: "description", content: "Bibliothèque globale des combinaisons" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const combinations = await getAllCombinations();
  return json({ combinations });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const patternJSON = formData.get("pattern") as string;
    let pattern = [];
    try {
      pattern = JSON.parse(patternJSON || '[]');
    } catch (e) {
      return json({ success: false, error: "Invalid pattern JSON" });
    }

    await createCombination({
      name: formData.get("name") as string,
      displayName: formData.get("displayName") as string,
      description: formData.get("description") as string || undefined,
      pattern,
      baseMultiplier: parseFloat(formData.get("baseMultiplier") as string),
      isActive: formData.get("isActive") === "true",
    });
    return json({ success: true });
  }

  if (intent === "update") {
    const patternJSON = formData.get("pattern") as string;
    let pattern = undefined;
    try {
      pattern = JSON.parse(patternJSON || '[]');
    } catch (e) {
      return json({ success: false, error: "Invalid pattern JSON" });
    }

    await updateCombination(formData.get("id") as string, {
      name: formData.get("name") as string,
      displayName: formData.get("displayName") as string,
      description: formData.get("description") as string || undefined,
      pattern,
      baseMultiplier: parseFloat(formData.get("baseMultiplier") as string),
      isActive: formData.get("isActive") === "true",
    });
    return json({ success: true });
  }

  if (intent === "delete") {
    await deleteCombination(formData.get("id") as string);
    return json({ success: true });
  }

  return json({ success: false });
}

export default function ResourcesCombinations() {
  const { combinations } = useLoaderData<typeof loader>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Combinaisons"
          description="Bibliothèque globale des combinaisons disponibles dans le jeu"
        />
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {showCreateForm && (
        <ComboForm
          onCancel={() => setShowCreateForm(false)}
          intent="create"
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {combinations.map((combo) => (
          <div key={combo.id}>
            {editingId === combo.id ? (
              <ComboForm
                combo={combo}
                onCancel={() => setEditingId(null)}
                intent="update"
              />
            ) : (
              <ComboCard
                combo={combo}
                onEdit={() => setEditingId(combo.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComboCard({ combo, onEdit }: { combo: any; onEdit: () => void }) {
  const fetcher = useFetcher();

  const handleDelete = () => {
    if (confirm(`Supprimer la combinaison "${combo.displayName}" ?`)) {
      fetcher.submit(
        { intent: "delete", id: combo.id },
        { method: "post" }
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{combo.displayName}</CardTitle>
          <Badge variant={combo.isActive ? "default" : "secondary"}>
            {combo.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {combo.description && (
            <p className="text-muted-foreground text-xs">{combo.description}</p>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Multiplicateur:</span>
            <span className="font-medium">×{combo.baseMultiplier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pattern:</span>
            <span className="font-medium text-xs">{combo.pattern.length} ligne(s)</span>
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

function ComboForm({
  combo,
  onCancel,
  intent,
}: {
  combo?: any;
  onCancel: () => void;
  intent: "create" | "update";
}) {
  const fetcher = useFetcher();
  const [isActive, setIsActive] = useState(combo?.isActive ?? true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intent === "create" ? "Nouvelle combinaison" : "Modifier"}</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form
          method="post"
          className="space-y-4"
          onSubmit={() => setTimeout(onCancel, 100)}
        >
          <input type="hidden" name="intent" value={intent} />
          {intent === "update" && <input type="hidden" name="id" value={combo?.id} />}
          <input type="hidden" name="isActive" value={String(isActive)} />

          <div className="space-y-2">
            <Label>Nom technique</Label>
            <Input name="name" defaultValue={combo?.name} required />
          </div>

          <div className="space-y-2">
            <Label>Nom d'affichage</Label>
            <Input name="displayName" defaultValue={combo?.displayName} required />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input name="description" defaultValue={combo?.description} />
          </div>

          <div className="space-y-2">
            <Label>Pattern (JSON array 2D)</Label>
            <textarea
              name="pattern"
              defaultValue={combo ? JSON.stringify(combo.pattern, null, 2) : '[[1,1,1]]'}
              className="w-full px-3 py-2 border rounded-md font-mono text-xs"
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Ex: {`[[1,1,1]]`} pour 3 symboles identiques
            </p>
          </div>

          <div className="space-y-2">
            <Label>Multiplicateur de base</Label>
            <Input
              name="baseMultiplier"
              type="number"
              step="0.1"
              defaultValue={combo?.baseMultiplier || 1}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)}
            />
            <Label htmlFor="isActive">Actif</Label>
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
