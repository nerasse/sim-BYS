import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getAllEffects, createEffect, updateEffect, deleteEffect } from "~/db/queries/effects";
import { PageHeader } from "~/components/layout/page-header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { useState } from "react";
import { EFFECT_TYPES, EFFECT_UNITS, EFFECT_CATEGORIES, EFFECT_TARGETS } from "~/lib/constants/effect-types";
import { EffectTypeConfig } from "~/components/effects/effect-type-config";

export const meta: MetaFunction = () => {
  return [
    { title: "Effets - Simulateur BYS" },
    { name: "description", content: "Bibliothèque centralisée des effets réutilisables" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const effects = await getAllEffects();
  return json({ effects });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const configJSON = formData.get("config") as string;
    let config = null;
    try {
      config = configJSON ? JSON.parse(configJSON) : null;
    } catch (e) {
      // Ignore invalid JSON
    }

    await createEffect({
      name: formData.get("name") as string,
      displayName: formData.get("displayName") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      category: formData.get("category") as "passive" | "active" | "trigger",
      target: formData.get("target") as string || undefined,
      defaultValue: parseFloat(formData.get("defaultValue") as string),
      unit: formData.get("unit") as string || undefined,
      icon: formData.get("icon") as string || undefined,
      config,
    });
    return json({ success: true });
  }

  if (intent === "update") {
    const configJSON = formData.get("config") as string;
    let config = null;
    try {
      config = configJSON ? JSON.parse(configJSON) : null;
    } catch (e) {
      // Ignore invalid JSON
    }

    await updateEffect(formData.get("id") as string, {
      name: formData.get("name") as string,
      displayName: formData.get("displayName") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      category: formData.get("category") as "passive" | "active" | "trigger",
      target: formData.get("target") as string || undefined,
      defaultValue: parseFloat(formData.get("defaultValue") as string),
      unit: formData.get("unit") as string || undefined,
      icon: formData.get("icon") as string || undefined,
      config,
    });
    return json({ success: true });
  }

  if (intent === "delete") {
    await deleteEffect(formData.get("id") as string);
    return json({ success: true });
  }

  return json({ success: false });
}

const categoryColors: Record<string, string> = {
  passive: "bg-blue-500",
  active: "bg-green-500",
  trigger: "bg-purple-500",
};

export default function Effects() {
  const { effects } = useLoaderData<typeof loader>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-8">
      {/* TARGETS SECTION - READ ONLY */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">🎯 Cibles d'Effets</h2>
          <p className="text-sm text-muted-foreground">Constantes système (non modifiables pour éviter le chaos)</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {EFFECT_TARGETS.map((target) => (
            <div key={target.value} className="border rounded-lg p-3 bg-muted/20">
              <div className="space-y-2">
                <span className="text-2xl">{target.icon}</span>
                <div>
                  <div className="font-medium text-sm">{target.label}</div>
                  <code className="text-xs text-muted-foreground">{target.value}</code>
                  <p className="text-xs text-muted-foreground mt-1">{target.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EFFECTS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="⚡ Effets"
            description="Bibliothèque centralisée des effets réutilisables (référencés par bonus, jokers, personnages)"
          />
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un effet
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-card border rounded-lg p-4">
            <EffectForm onCancel={() => setShowCreateForm(false)} intent="create" />
          </div>
        )}

      {/* Table List */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="text-left p-3 font-semibold">Nom</th>
              <th className="text-left p-3 font-semibold">Code</th>
              <th className="text-left p-3 font-semibold">Type</th>
              <th className="text-left p-3 font-semibold">Catégorie</th>
              <th className="text-left p-3 font-semibold">Cible</th>
              <th className="text-left p-3 font-semibold">Valeur défaut</th>
              <th className="text-right p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {effects.map((effect) => (
              <tr key={effect.id} className="border-b hover:bg-muted/30">
                {editingId === effect.id ? (
                  <td colSpan={7} className="p-4">
                    <EffectForm
                      effect={effect}
                      onCancel={() => setEditingId(null)}
                      intent="update"
                    />
                  </td>
                ) : (
                  <>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {effect.icon && <span className="text-lg">{effect.icon}</span>}
                        <div>
                          <div className="font-medium">{effect.displayName}</div>
                          <div className="text-xs text-muted-foreground">{effect.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{effect.name}</code>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{effect.type}</span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded text-white ${categoryColors[effect.category]}`}>
                        {effect.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{effect.target || "-"}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-mono">
                        {effect.defaultValue}{effect.unit || ""}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <EffectActions
                          effectId={effect.id}
                          effectName={effect.displayName}
                          onEdit={() => setEditingId(effect.id)}
                        />
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {effects.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <p>Aucun effet créé</p>
            <p className="text-sm mt-2">Créez des effets réutilisables pour vos objets</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function EffectActions({
  effectId,
  effectName,
  onEdit,
}: {
  effectId: string;
  effectName: string;
  onEdit: () => void;
}) {
  const fetcher = useFetcher();

  const handleDelete = () => {
    if (confirm(`Supprimer l'effet "${effectName}" ?\n\nAttention : Cela peut casser les objets qui l'utilisent.`)) {
      fetcher.submit({ intent: "delete", id: effectId }, { method: "post" });
    }
  };

  return (
    <>
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
    </>
  );
}

function EffectForm({
  effect,
  onCancel,
  intent,
}: {
  effect?: any;
  onCancel: () => void;
  intent: "create" | "update";
}) {
  const fetcher = useFetcher();
  const [selectedType, setSelectedType] = useState(effect?.type || "multiplier");
  const [typeConfig, setTypeConfig] = useState(effect?.config || {});

  return (
    <fetcher.Form
      method="post"
      className="grid grid-cols-3 gap-4"
      onSubmit={(e) => {
        // Inject config as JSON
        const form = e.currentTarget;
        const configInput = document.createElement("input");
        configInput.type = "hidden";
        configInput.name = "config";
        configInput.value = JSON.stringify(typeConfig);
        form.appendChild(configInput);
        setTimeout(onCancel, 100);
      }}
    >
      <input type="hidden" name="intent" value={intent} />
      {intent === "update" && <input type="hidden" name="id" value={effect?.id} />}

      <div className="space-y-2">
        <Label className="text-xs">Nom technique (unique)</Label>
        <Input
          name="name"
          defaultValue={effect?.name}
          placeholder="score_multiplier"
          className="h-9"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Nom d'affichage</Label>
        <Input
          name="displayName"
          defaultValue={effect?.displayName}
          placeholder="Multiplicateur de score"
          className="h-9"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Description</Label>
        <Input
          name="description"
          defaultValue={effect?.description}
          placeholder="Multiplie le score obtenu"
          className="h-9"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Type</Label>
        <select
          name="type"
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setTypeConfig({}); // Reset config when type changes
          }}
          className="h-9 w-full px-3 py-2 border rounded-md"
          required
        >
          {EFFECT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Catégorie</Label>
        <select
          name="category"
          defaultValue={effect?.category || "passive"}
          className="h-9 w-full px-3 py-2 border rounded-md"
          required
        >
          {EFFECT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Cible</Label>
        <select
          name="target"
          defaultValue={effect?.target || ""}
          className="h-9 w-full px-3 py-2 border rounded-md"
        >
          <option value="">Aucune</option>
          {EFFECT_TARGETS.map((target) => (
            <option key={target.value} value={target.value}>
              {target.icon} {target.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Valeur défaut</Label>
        <Input
          name="defaultValue"
          type="number"
          step="0.01"
          defaultValue={effect?.defaultValue || 1}
          className="h-9"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Unité</Label>
        <select
          name="unit"
          defaultValue={effect?.unit || ""}
          className="h-9 w-full px-3 py-2 border rounded-md"
        >
          {EFFECT_UNITS.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Icône (emoji)</Label>
        <Input
          name="icon"
          defaultValue={effect?.icon || ""}
          placeholder="⚡"
          maxLength={2}
          className="h-9"
        />
      </div>

      {/* Configuration spécifique au type */}
      <div className="col-span-3">
        <EffectTypeConfig
          type={selectedType}
          initialConfig={typeConfig}
          onChange={setTypeConfig}
        />
      </div>

      <div className="col-span-3 flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="w-3 h-3 mr-1" />
          Annuler
        </Button>
        <Button type="submit" size="sm" disabled={fetcher.state !== "idle"}>
          <Save className="w-3 h-3 mr-1" />
          {fetcher.state !== "idle" ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>
    </fetcher.Form>
  );
}
