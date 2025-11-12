import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { 
  getAllObjectSelectionPresets,
  createObjectSelectionPreset,
  deleteObjectSelectionPreset,
  duplicateObjectSelectionPreset
} from "~/db/queries/object-selection-presets";
import { 
  copyObjectSelectionBonuses 
} from "~/db/queries/object-selection-bonuses";
import { 
  copyObjectSelectionJokers 
} from "~/db/queries/object-selection-jokers";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Plus, Copy, Trash2, Settings, X, Check, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { useModal } from "~/contexts/modal-context";

export const meta: MetaFunction = () => {
  return [
    { title: "Sélections d'Objets - Ressources - Simulateur BYS" },
    { name: "description", content: "Gérer les sous-presets de disponibilité d'objets par niveau" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const objectSelectionPresets = await getAllObjectSelectionPresets();
  return json({ objectSelectionPresets });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    
    const newPreset = await createObjectSelectionPreset({
      name: name || "Nouveau sous-preset",
      description: description || "",
      tags: [],
    });

    return json({ success: true, preset: newPreset });
  }

  if (intent === "delete") {
    const id = formData.get("id") as string;
    try {
      await deleteObjectSelectionPreset(id);
      return json({ success: true });
    } catch (error: any) {
      return json({ 
        success: false, 
        error: error.message || "Erreur lors de la suppression" 
      }, { status: 400 });
    }
  }

  if (intent === "duplicate") {
    const id = formData.get("id") as string;
    const newPreset = await duplicateObjectSelectionPreset(id);
    
    // Copy availabilities
    await copyObjectSelectionBonuses(id, newPreset!.id);
    await copyObjectSelectionJokers(id, newPreset!.id);
    
    return json({ success: true });
  }

  return json({ success: false });
}

export default function ResourcesObjectSelections() {
  const { objectSelectionPresets } = useLoaderData<typeof loader>();
  const [isCreating, setIsCreating] = useState(false);
  const modal = useModal();

  const handleCreate = async () => {
    const name = await modal.prompt({
      title: "Nouvelle sélection d'objets",
      description: "Donnez un nom à cette sélection",
      placeholder: "Nom de la sélection",
      defaultValue: "Nouvelle sélection",
      confirmText: "Créer",
      cancelText: "Annuler",
    });

    if (!name) return;

    setIsCreating(true);
  };

  return (
    <div>
      <PageHeader
        title="Sélections d'Objets"
        description="Sous-presets réutilisables définissant la disponibilité des bonus et jokers par niveau"
        actions={
          !isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Sélection
            </Button>
          )
        }
      />

      {/* Create Form */}
      {isCreating && (
        <Card className="mb-6 border-primary">
          <CardContent className="pt-6">
            <CreateForm onSuccess={() => setIsCreating(false)} />
          </CardContent>
        </Card>
      )}

      {/* Presets List */}
      {objectSelectionPresets.length === 0 && !isCreating ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-12">
              <Settings className="w-24 h-24 mx-auto mb-4 opacity-20" />
              <p className="mb-2 text-lg font-medium">Aucune sélection d'objets</p>
              <p className="text-sm mb-6">
                Les sélections permettent de définir quels bonus et jokers sont disponibles à chaque niveau
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer la première sélection
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !isCreating && (
        <Card>
          <div className="divide-y">
            {objectSelectionPresets.map((preset) => (
              <PresetRow key={preset.id} preset={preset} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function CreateForm({ onSuccess }: { onSuccess: () => void }) {
  const fetcher = useFetcher();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  React.useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      setName("");
      setDescription("");
      onSuccess();
    }
  }, [fetcher.state, fetcher.data, onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    fetcher.submit(
      {
        intent: "create",
        name,
        description,
      },
      { method: "post" }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Créer une sélection</h3>
        <Button size="sm" variant="ghost" type="button" onClick={onSuccess}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div>
        <Label htmlFor="name">Nom de la sélection</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Objets Monde 1-3"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description (optionnelle)</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Configuration pour les premiers mondes"
        />
      </div>

      <Button type="submit" className="w-full" disabled={!name.trim()}>
        <Check className="w-4 h-4 mr-2" />
        Créer
      </Button>
    </form>
  );
}

function PresetRow({ preset }: { preset: any }) {
  const fetcher = useFetcher();
  const modal = useModal();

  React.useEffect(() => {
    if (fetcher.data && !fetcher.data.success && fetcher.data.error) {
      modal.alert({
        title: "Erreur de suppression",
        description: fetcher.data.error,
      });
    }
  }, [fetcher.data, modal]);

  const handleDuplicate = () => {
    fetcher.submit(
      { intent: "duplicate", id: preset.id },
      { method: "post" }
    );
  };

  const handleDelete = async () => {
    const confirmed = await modal.confirm({
      title: "Supprimer la sélection ?",
      description: `Êtes-vous sûr de vouloir supprimer "${preset.name}" ?\n\nCette action supprimera également toutes ses configurations d'objets.`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "destructive",
    });

    if (!confirmed) return;

    fetcher.submit(
      { intent: "delete", id: preset.id },
      { method: "post" }
    );
  };

  return (
    <div className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate">{preset.name}</h3>
            {preset.tags.length > 0 && (
              <div className="flex gap-1">
                {preset.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {preset.description && (
            <p className="text-sm text-muted-foreground truncate">{preset.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/resources/object-selections/${preset.id}`}>
            <Button size="sm" variant="default">
              <Settings className="w-4 h-4 mr-2" />
              Configurer
            </Button>
          </Link>
          
          <Button onClick={handleDuplicate} variant="ghost" size="sm" title="Dupliquer">
            <Copy className="w-4 h-4" />
          </Button>
          
          <Button onClick={handleDelete} variant="ghost" size="sm" title="Supprimer">
            <Trash2 className="w-4 h-4" />
          </Button>

          <Link to={`/resources/object-selections/${preset.id}`}>
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
