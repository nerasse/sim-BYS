import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getAllConnections, createConnection, updateConnection, deleteConnection, reorderConnections } from "~/db/queries/connections";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Plus, Edit2, Trash2, Save, X, Grid3x3, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { PatternGrid, CONNECTION_PRESETS, type Position, type ConnectionPresetKey } from "~/components/ui/pattern-grid";

/**
 * PAS DE CONVERSION - on utilise directement le format Position[]
 */
function normalizePattern(pattern: Position[] | null | undefined): Position[] {
  return pattern || [];
}

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
    let pattern: Position[] = [];
    try {
      pattern = JSON.parse(patternJSON || '[]');
    } catch (e) {
      return json({ success: false, error: "Invalid pattern JSON" });
    }

    await createConnection({
      name: formData.get("name") as string,
      displayName: formData.get("displayName") as string,
      description: formData.get("description") as string || undefined,
      pattern, // Stocké comme Position[]
      baseMultiplier: parseFloat(formData.get("baseMultiplier") as string),
      isActive: formData.get("isActive") === "true",
    });
    return json({ success: true });
  }

  if (intent === "update") {
    const patternJSON = formData.get("pattern") as string;
    let pattern: Position[] | undefined = undefined;
    try {
      pattern = JSON.parse(patternJSON || '[]');
    } catch (e) {
      return json({ success: false, error: "Invalid pattern JSON" });
    }

    await updateConnection(formData.get("id") as string, {
      name: formData.get("name") as string,
      displayName: formData.get("displayName") as string,
      description: formData.get("description") as string || undefined,
      pattern, // Stocké comme Position[]
      baseMultiplier: parseFloat(formData.get("baseMultiplier") as string),
      isActive: formData.get("isActive") === "true",
    });
    return json({ success: true });
  }

  if (intent === "delete") {
    await deleteConnection(formData.get("id") as string);
    return json({ success: true });
  }

  if (intent === "reorder") {
    const reorderedIds = formData.get("reorderedIds") as string;
    const idsArray = JSON.parse(reorderedIds);
    await reorderConnections(idsArray);
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
        {connections.map((connection, index) => (
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
                index={index}
                total={connections.length}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComboListItem({ combo, onEdit, index, total }: { 
  combo: {
    id: string;
    displayName: string;
    description?: string;
    baseMultiplier: number;
    isActive: boolean;
    pattern: Position[] | null | undefined;
  }; 
  onEdit: () => void;
  index: number;
  total: number;
}) {
  const fetcher = useFetcher();
  const { connections } = useLoaderData<typeof loader>();

  const handleDelete = () => {
    if (confirm(`Supprimer la connexion "${combo.displayName}" ?`)) {
      fetcher.submit(
        { intent: "delete", id: combo.id },
        { method: "post" }
      );
    }
  };

  const handleMoveUp = () => {
    if (index > 0) {
      const newOrder = [...connections];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      const reorderedIds = newOrder.map(c => c.id);
      fetcher.submit(
        { intent: "reorder", reorderedIds: JSON.stringify(reorderedIds) },
        { method: "post" }
      );
    }
  };

  const handleMoveDown = () => {
    if (index < total - 1) {
      const newOrder = [...connections];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      const reorderedIds = newOrder.map(c => c.id);
      fetcher.submit(
        { intent: "reorder", reorderedIds: JSON.stringify(reorderedIds) },
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
              <span className="text-muted-foreground">Ordre:</span>
              <span className="font-medium">{index + 1}</span>
            </div>
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
            <div className="mt-3">
              <PatternGrid
                value={normalizePattern(combo.pattern)}
                readonly={true}
                compact={true}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleMoveUp}
              disabled={index === 0 || fetcher.state !== "idle"}
              title="Monter"
            >
              <ArrowUp className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleMoveDown}
              disabled={index === total - 1 || fetcher.state !== "idle"}
              title="Descendre"
            >
              <ArrowDown className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex gap-1">
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
    </div>
  );
}

function ComboForm({
  combo,
  onCancel,
  intent,
}: {
  combo?: {
    id?: string;
    name?: string;
    displayName?: string;
    description?: string;
    baseMultiplier?: number;
    isActive?: boolean;
    pattern?: Position[] | null | undefined;
  };
  onCancel: () => void;
  intent: "create" | "update";
}) {
  const fetcher = useFetcher();
  const [isActive, setIsActive] = useState(combo?.isActive ?? true);
  const [pattern, setPattern] = useState<Position[]>(
    combo?.pattern ? normalizePattern(combo.pattern) : []
  );
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5" />
          {intent === "create" ? "Nouvelle connexion" : "Modifier"}
        </CardTitle>
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
          <input type="hidden" name="pattern" value={JSON.stringify(pattern)} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom technique</Label>
              <Input name="name" defaultValue={combo?.name} required />
            </div>

            <div className="space-y-2">
              <Label>Nom d'affichage</Label>
              <Input name="displayName" defaultValue={combo?.displayName} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input name="description" defaultValue={combo?.description} />
          </div>

          {/* Pattern Grid Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Pattern de la connexion</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="preset" className="text-sm text-muted-foreground">
                  Preset:
                </Label>
                <Select value={selectedPreset} onValueChange={(value) => {
                  setSelectedPreset(value);
                  if (value && value !== "custom") {
                    const preset = CONNECTION_PRESETS[value as ConnectionPresetKey];
                    if (preset) {
                      setPattern([...preset.positions]);
                    }
                  }
                }}>
                  <SelectTrigger id="preset" className="w-40">
                    <SelectValue placeholder="Choisir un preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                    {Object.entries(CONNECTION_PRESETS).map(([key, preset]) => (
                      <SelectItem key={key} value={key}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-center">
              <PatternGrid
                value={pattern}
                onChange={setPattern}
                readonly={false}
                compact={false}
              />
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Cliquez sur les cases pour définir le pattern • {pattern.length} position{pattern.length > 1 ? 's' : ''} sélectionnée{pattern.length > 1 ? 's' : ''}
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
