import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { getAllPresets, createPreset, deletePreset, updatePreset, duplicatePreset } from "~/db/queries/presets";
import { getActivePreset, setActivePreset } from "~/db/queries/active-preset";
import { useModal } from "~/contexts/modal-context";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Save, Plus, Trash2, Star, Copy, Settings, ChevronRight } from "lucide-react";
import React from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const [presets, activePresetData] = await Promise.all([
    getAllPresets(),
    getActivePreset(),
  ]);

  return json({
    presets,
    activePresetId: activePresetData?.presetId || null,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id") as string;
    await deletePreset(id);
    return json({ success: true });
  }

  if (intent === "toggleFavorite") {
    const id = formData.get("id") as string;
    const isFavorite = formData.get("isFavorite") === "true";
    await updatePreset(id, { isFavorite: !isFavorite });
    return json({ success: true });
  }

  if (intent === "create") {
    const name = formData.get("name") as string || "Nouveau Preset";
    const description = formData.get("description") as string || "Configuration personnalisée";
    
    const newPreset = await createPreset({
      name,
      description,
      tags: ["custom"],
      isFavorite: false,
    });

    return json({ success: true, preset: newPreset });
  }

  if (intent === "duplicate") {
    const sourceId = formData.get("id") as string;
    const name = formData.get("name") as string || "Copie de preset";
    
    await duplicatePreset(sourceId, name);
    return json({ success: true });
  }

  if (intent === "setActive") {
    const id = formData.get("id") as string;
    await setActivePreset(id);
    return redirect("/config");
  }

  return json({ success: false });
}

export default function Presets() {
  const { presets, activePresetId } = useLoaderData<typeof loader>();
  const modal = useModal();
  const fetcher = useFetcher();

  const handleCreatePreset = async () => {
    const name = await modal.prompt({
      title: "Créer un nouveau preset",
      description: "Donnez un nom à votre preset",
      placeholder: "Nom du preset",
      defaultValue: "Nouveau Preset",
      confirmText: "Créer",
      cancelText: "Annuler",
    });

    if (!name) return;

    fetcher.submit(
      { intent: "create", name, description: "Configuration personnalisée" },
      { method: "post" }
    );
  };

  const handleDuplicate = async (preset: any) => {
    const name = await modal.prompt({
      title: "Dupliquer le preset",
      description: `Donnez un nom à la copie de "${preset.name}"`,
      placeholder: "Nom du nouveau preset",
      defaultValue: `Copie de ${preset.name}`,
      confirmText: "Dupliquer",
      cancelText: "Annuler",
    });

    if (!name) return;

    fetcher.submit(
      { intent: "duplicate", id: preset.id, name },
      { method: "post" }
    );
  };

  const handleDelete = async (preset: any) => {
    const confirmed = await modal.confirm({
      title: "Supprimer le preset ?",
      description: `Êtes-vous sûr de vouloir supprimer "${preset.name}" ?\n\nCette action est irréversible et supprimera toutes les configurations associées.`,
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

  const handleToggleFavorite = (preset: any) => {
    fetcher.submit(
      { intent: "toggleFavorite", id: preset.id, isFavorite: preset.isFavorite.toString() },
      { method: "post" }
    );
  };

  const handleSetActive = (preset: any) => {
    fetcher.submit(
      { intent: "setActive", id: preset.id },
      { method: "post" }
    );
  };

  // Séparer favoris et non-favoris
  const favoritePresets = presets.filter((p) => p.isFavorite);
  const otherPresets = presets.filter((p) => !p.isFavorite);

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Save className="w-8 h-8" />
            Presets
          </div>
        }
        description="Gestion des configurations sauvegardées"
        actions={
          <Button onClick={handleCreatePreset}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Preset
          </Button>
        }
      />

      {presets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-12">
              <Save className="w-24 h-24 mx-auto mb-4 opacity-20" />
              <p className="mb-2 text-lg font-medium">Aucun preset disponible</p>
              <p className="text-sm mb-6">
                Créez votre premier preset pour commencer
              </p>
              <Button onClick={handleCreatePreset}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un preset
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Favoris */}
          {favoritePresets.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                <Star className="w-5 h-5 fill-primary text-primary" />
                Favoris
              </h2>
              <Card>
                <div className="divide-y">
                  {favoritePresets.map((preset) => (
                    <PresetRow
                      key={preset.id}
                      preset={preset}
                      isActive={preset.id === activePresetId}
                      onToggleFavorite={() => handleToggleFavorite(preset)}
                      onDuplicate={() => handleDuplicate(preset)}
                      onDelete={() => handleDelete(preset)}
                      onSetActive={() => handleSetActive(preset)}
                    />
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Autres presets */}
          {otherPresets.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                Tous les presets
              </h2>
              <Card>
                <div className="divide-y">
                  {otherPresets.map((preset) => (
                    <PresetRow
                      key={preset.id}
                      preset={preset}
                      isActive={preset.id === activePresetId}
                      onToggleFavorite={() => handleToggleFavorite(preset)}
                      onDuplicate={() => handleDuplicate(preset)}
                      onDelete={() => handleDelete(preset)}
                      onSetActive={() => handleSetActive(preset)}
                    />
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface PresetRowProps {
  preset: any;
  isActive: boolean;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSetActive: () => void;
}

function PresetRow({
  preset,
  isActive,
  onToggleFavorite,
  onDuplicate,
  onDelete,
  onSetActive,
}: PresetRowProps) {
  return (
    <div className={`p-4 hover:bg-accent/50 transition-colors ${isActive ? 'bg-primary/5' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate">{preset.name}</h3>
            {isActive && <Badge variant="default" className="text-xs">Actif</Badge>}
            <div className="flex gap-1">
              {preset.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          {preset.description && (
            <p className="text-sm text-muted-foreground truncate">{preset.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFavorite}
            className={preset.isFavorite ? "text-primary" : ""}
          >
            <Star className={`w-4 h-4 ${preset.isFavorite ? "fill-primary" : ""}`} />
          </Button>

          {!isActive ? (
            <Button onClick={onSetActive} size="sm" variant="default">
              Activer
            </Button>
          ) : (
            <Link to="/config">
              <Button size="sm" variant="secondary">
                <Settings className="w-4 h-4 mr-2" />
                Configurer
              </Button>
            </Link>
          )}
          
          <Button onClick={onDuplicate} variant="ghost" size="sm">
            <Copy className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            disabled={isActive}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {isActive && (
            <Link to="/config">
              <Button variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
