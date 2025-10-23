import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { getAllPresets, createPreset, deletePreset, updatePreset, duplicatePreset } from "~/db/queries/presets";
import { getActivePreset, setActivePreset } from "~/db/queries/active-preset";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Save, Plus, Trash2, Star, Copy, Settings } from "lucide-react";

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
    
    await createPreset({
      name,
      description,
      tags: ["custom"],
      isFavorite: false,
    });

    return json({ success: true });
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

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Save className="w-8 h-8" />
            Presets
          </div>
        }
        description="Gestion des configurations sauvegardées - Créez, dupliquez et gérez vos presets"
        actions={
          <Form method="post" className="flex gap-2 items-end">
            <div>
              <Input
                type="text"
                name="name"
                placeholder="Nom du preset"
                defaultValue="Nouveau Preset"
                className="w-48"
              />
            </div>
            <input type="hidden" name="intent" value="create" />
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Créer
            </Button>
          </Form>
        }
      />

      {presets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-12">
              <div className="flex justify-center mb-4">
                <Save className="w-24 h-24" />
              </div>
              <p className="mb-4">Aucun preset sauvegardé</p>
              <p className="text-sm mb-6">
                Les presets vous permettent de sauvegarder des configurations complètes
                <br />
                (symboles, combos, niveaux, rarités boutique) pour tester différentes configurations.
              </p>
              <Form method="post">
                <input type="hidden" name="intent" value="create" />
                <input type="hidden" name="name" value="Mon premier preset" />
                <Button type="submit" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Créer votre premier preset
                </Button>
              </Form>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => {
            const isActive = preset.id === activePresetId;
            
            return (
              <Card
                key={preset.id}
                className={
                  isActive
                    ? "border-primary bg-primary/5"
                    : preset.isFavorite
                    ? "border-primary/50"
                    : ""
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {preset.name}
                      {isActive && (
                        <Badge variant="default">Actif</Badge>
                      )}
                      {preset.isFavorite && !isActive && (
                        <Star className="w-4 h-4 fill-primary text-primary" />
                      )}
                    </CardTitle>
                    <Form method="post">
                      <input type="hidden" name="intent" value="toggleFavorite" />
                      <input type="hidden" name="id" value={preset.id} />
                      <input
                        type="hidden"
                        name="isFavorite"
                        value={preset.isFavorite.toString()}
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            preset.isFavorite
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </Form>
                  </div>
                  <CardDescription>{preset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {preset.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
                      {!isActive && (
                        <Form method="post" className="flex-1">
                          <input type="hidden" name="intent" value="setActive" />
                          <input type="hidden" name="id" value={preset.id} />
                          <Button className="w-full" size="sm" variant="default">
                            <Settings className="w-4 h-4 mr-2" />
                            Activer
                          </Button>
                        </Form>
                      )}
                      
                      {isActive && (
                        <Link to="/config" className="flex-1">
                          <Button className="w-full" size="sm" variant="secondary">
                            <Settings className="w-4 h-4 mr-2" />
                            Configurer
                          </Button>
                        </Link>
                      )}
                      
                      <Form method="post">
                        <input type="hidden" name="intent" value="duplicate" />
                        <input type="hidden" name="id" value={preset.id} />
                        <input type="hidden" name="name" value={`Copie de ${preset.name}`} />
                        <Button type="submit" variant="outline" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </Form>
                      
                      <Form method="post">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={preset.id} />
                        <Button
                          type="submit"
                          variant="destructive"
                          size="sm"
                          disabled={isActive}
                          onClick={(e) => {
                            if (!confirm("Êtes-vous sûr de vouloir supprimer ce preset ?")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="mt-8 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            À propos des Presets
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Preset Actif</strong> : Le preset que vous configurez actuellement dans l'onglet Configuration.
            Toutes les modifications que vous faites s'appliquent au preset actif.
          </p>
          <p>
            <strong>Création</strong> : Un nouveau preset est créé avec les valeurs par défaut du jeu.
            Vous pouvez ensuite l'activer et le modifier dans Configuration.
          </p>
          <p>
            <strong>Duplication</strong> : Utilisez l'icône <Copy className="w-3 h-3 inline" /> pour créer
            une copie d'un preset existant avec toutes ses configurations.
          </p>
          <p>
            <strong>Favoris</strong> : Marquez vos presets préférés avec <Star className="w-3 h-3 inline" /> pour
            les retrouver facilement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
