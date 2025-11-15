import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getAllConnections, createConnection, updateConnection, deleteConnection } from "~/db/queries/connections";
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
    { title: "Connexions - Ressources - Simulateur BYS" },
    { name: "description", content: "Bibliothèque globale des connexions" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const connections = await getAllConnections();
  return json({ connections });
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

    await createConnection({
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

    await updateConnection(formData.get("id") as string, {
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
    await deleteConnection(formData.get("id") as string);
    return json({ success: true });
  }

  return json({ success: false });
}

export default function ResourcesCombinations() {
  const { connections } = useLoaderData<typeof loader>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Connexions"
          description="Bibliothèque globale des connexions disponibles dans le jeu"
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

      <div className="border rounded-lg divide-y">
        {connections.map((connection) => (
          <div key={connection.id}>
            {editingId === connection.id ? (
              <ComboForm
                combo={connection}
                onCancel={() => setEditingId(null)}
                intent="update"
              />
            ) : (
              <ComboListItem
                combo={connection}
                onEdit={() => setEditingId(connection.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComboListItem({ combo, onEdit }: { combo: any; onEdit: () => void }) {
  const fetcher = useFetcher();

  const handleDelete = () => {
    if (confirm(`Supprimer la connexion "${combo.displayName}" ?`)) {
      fetcher.submit(
        { intent: "delete", id: combo.id },
        { method: "post" }
      );
    }
  };

  return (
    <div className="p-6 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">{combo.displayName}</h3>
            <Badge variant={combo.isActive ? "default" : "secondary"}>
              {combo.isActive ? "Actif" : "Inactif"}
            </Badge>
          </div>
          {combo.description && (
            <p className="text-muted-foreground text-sm mb-3">{combo.description}</p>
          )}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Multiplicateur:</span>
              <span className="font-medium">×{combo.baseMultiplier}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Pattern:</span>
              <span className="font-medium">{combo.pattern.length} ligne(s)</span>
            </div>
          </div>
          {/* Pattern Preview */}
          {combo.pattern && combo.pattern.length > 0 && (
            <div className="mt-3 p-3 bg-muted/50 rounded-md inline-block">
              <div className="space-y-1">
                {combo.pattern.map((row: any, i: number) => (
                  <div key={i} className="flex gap-1">
                    {row.map((cell: any, j: number) => (
                      <div
                        key={j}
                        className={`w-6 h-6 rounded border text-xs flex items-center justify-center font-mono ${
                          cell ? "bg-primary text-primary-foreground" : "bg-background"
                        }`}
                        title={cell || "vide"}
                      >
                        {cell ? "■" : "□"}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
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
        <CardTitle>{intent === "create" ? "Nouvelle connexion" : "Modifier"}</CardTitle>
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
