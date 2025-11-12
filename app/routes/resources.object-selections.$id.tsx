import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { getObjectSelectionPresetById } from "~/db/queries/object-selection-presets";
import { 
  getObjectSelectionBonuses,
  upsertObjectSelectionBonus,
  deleteObjectSelectionBonus
} from "~/db/queries/object-selection-bonuses";
import { 
  getObjectSelectionJokers,
  upsertObjectSelectionJoker,
  deleteObjectSelectionJoker
} from "~/db/queries/object-selection-jokers";
import { getAllBonuses } from "~/db/queries/bonuses";
import { getAllJokers } from "~/db/queries/jokers";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowLeft, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import React, { useState } from "react";
import { useModal } from "~/contexts/modal-context";

export const meta: MetaFunction = () => {
  return [
    { title: "Configurer Sélection d'Objets - Ressources - Simulateur BYS" },
    { name: "description", content: "Configurer la disponibilité des objets par niveau" },
  ];
};

// Generate all level IDs (1-1 to 7-3)
const generateLevelIds = (): string[] => {
  const levels: string[] = [];
  for (let world = 1; world <= 7; world++) {
    for (let stage = 1; stage <= 3; stage++) {
      levels.push(`${world}-${stage}`);
    }
  }
  return levels;
};

const LEVEL_IDS = generateLevelIds();

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  const [preset, bonusConfigs, jokerConfigs, allBonuses, allJokers] = await Promise.all([
    getObjectSelectionPresetById(id),
    getObjectSelectionBonuses(id),
    getObjectSelectionJokers(id),
    getAllBonuses(),
    getAllJokers(),
  ]);

  if (!preset) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ 
    preset, 
    bonusConfigs, 
    jokerConfigs, 
    allBonuses, 
    allJokers 
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "add-bonus" || intent === "edit-bonus") {
    const bonusId = formData.get("bonusId") as string;
    const availableFrom = formData.get("availableFrom") as string;
    const availableUntil = formData.get("availableUntil") as string;

    await upsertObjectSelectionBonus(
      id, 
      bonusId, 
      availableFrom, 
      availableUntil === "null" || !availableUntil ? null : availableUntil
    );

    return json({ success: true });
  }

  if (intent === "delete-bonus") {
    const bonusId = formData.get("bonusId") as string;
    await deleteObjectSelectionBonus(id, bonusId);
    return json({ success: true });
  }

  if (intent === "add-joker" || intent === "edit-joker") {
    const jokerId = formData.get("jokerId") as string;
    const availableFrom = formData.get("availableFrom") as string;
    const availableUntil = formData.get("availableUntil") as string;

    await upsertObjectSelectionJoker(
      id, 
      jokerId, 
      availableFrom, 
      availableUntil === "null" || !availableUntil ? null : availableUntil
    );

    return json({ success: true });
  }

  if (intent === "delete-joker") {
    const jokerId = formData.get("jokerId") as string;
    await deleteObjectSelectionJoker(id, jokerId);
    return json({ success: true });
  }

  return json({ success: false });
}

export default function ResourcesObjectSelectionDetail() {
  const { preset, bonusConfigs, jokerConfigs, allBonuses, allJokers } = 
    useLoaderData<typeof loader>();

  return (
    <div>
      <PageHeader
        title={preset.name}
        description={preset.description || "Configuration de la disponibilité des objets par niveau"}
        actions={
          <Link to="/resources/object-selections">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bonus Section */}
        <BonusSection 
          bonusConfigs={bonusConfigs}
          allBonuses={allBonuses}
        />

        {/* Jokers Section */}
        <JokerSection 
          jokerConfigs={jokerConfigs}
          allJokers={allJokers}
        />
      </div>
    </div>
  );
}

// ============= Bonus Section Component =============

function BonusSection({ bonusConfigs, allBonuses }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const configuredBonusIds = new Set(
    bonusConfigs.map((c: any) => c.availability?.bonusId)
  );
  
  const availableBonuses = allBonuses.filter(
    (b: any) => !configuredBonusIds.has(b.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Bonus Disponibles</CardTitle>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add Form */}
        {isAdding && (
          <AddBonusForm
            availableBonuses={availableBonuses}
            onCancel={() => setIsAdding(false)}
            onSuccess={() => setIsAdding(false)}
          />
        )}

        {/* Configured Bonuses List */}
        {bonusConfigs.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">Aucun bonus configuré</p>
            <p className="text-sm">Cliquez sur "Ajouter" pour commencer</p>
          </div>
        ) : (
          bonusConfigs.map((config: any) => {
            const bonus = config.bonus;
            const availability = config.availability;
            if (!bonus || !availability) return null;

            return editingId === availability.bonusId ? (
              <EditBonusForm
                key={availability.bonusId}
                bonus={bonus}
                availability={availability}
                onCancel={() => setEditingId(null)}
                onSuccess={() => setEditingId(null)}
              />
            ) : (
              <BonusCard
                key={availability.bonusId}
                bonus={bonus}
                availability={availability}
                onEdit={() => setEditingId(availability.bonusId)}
              />
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function AddBonusForm({ availableBonuses, onCancel, onSuccess }: any) {
  const fetcher = useFetcher();
  const [selectedBonusId, setSelectedBonusId] = useState("");
  const [availableFrom, setAvailableFrom] = useState("1-1");
  const [availableUntil, setAvailableUntil] = useState("null");

  const handleSubmit = () => {
    fetcher.submit(
      {
        intent: "add-bonus",
        bonusId: selectedBonusId,
        availableFrom,
        availableUntil,
      },
      { method: "post" }
    );
    onSuccess();
  };

  return (
    <div className="p-4 border-2 border-primary rounded-lg bg-primary/5 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">Ajouter un bonus</h4>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs">Bonus</Label>
          <Select value={selectedBonusId} onValueChange={setSelectedBonusId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un bonus" />
            </SelectTrigger>
            <SelectContent>
              {availableBonuses.map((bonus: any) => (
                <SelectItem key={bonus.id} value={bonus.id}>
                  {bonus.name} ({bonus.rarity})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Disponible à partir de</Label>
            <Select value={availableFrom} onValueChange={setAvailableFrom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_IDS.map((level) => (
                  <SelectItem key={level} value={level}>
                    Niveau {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Disponible jusqu'à</Label>
            <Select value={availableUntil} onValueChange={setAvailableUntil}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">♾️ Toujours après</SelectItem>
                {LEVEL_IDS.map((level) => (
                  <SelectItem key={level} value={level}>
                    Niveau {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          size="sm" 
          className="w-full" 
          onClick={handleSubmit}
          disabled={!selectedBonusId}
        >
          <Check className="w-4 h-4 mr-2" />
          Confirmer
        </Button>
      </div>
    </div>
  );
}

function EditBonusForm({ bonus, availability, onCancel, onSuccess }: any) {
  const fetcher = useFetcher();
  const [availableFrom, setAvailableFrom] = useState(availability.availableFrom);
  const [availableUntil, setAvailableUntil] = useState(availability.availableUntil || "null");

  const handleSubmit = () => {
    fetcher.submit(
      {
        intent: "edit-bonus",
        bonusId: bonus.id,
        availableFrom,
        availableUntil,
      },
      { method: "post" }
    );
    onSuccess();
  };

  return (
    <div className="p-4 border-2 border-primary rounded-lg bg-primary/5 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">{bonus.name}</h4>
          <Badge variant="outline">{bonus.rarity}</Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Disponible à partir de</Label>
          <Select value={availableFrom} onValueChange={setAvailableFrom}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_IDS.map((level) => (
                <SelectItem key={level} value={level}>
                  Niveau {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Disponible jusqu'à</Label>
          <Select value={availableUntil} onValueChange={setAvailableUntil}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">♾️ Toujours après</SelectItem>
              {LEVEL_IDS.map((level) => (
                <SelectItem key={level} value={level}>
                  Niveau {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button size="sm" className="w-full" onClick={handleSubmit}>
        <Check className="w-4 h-4 mr-2" />
        Sauvegarder
      </Button>
    </div>
  );
}

function BonusCard({ bonus, availability, onEdit }: any) {
  const fetcher = useFetcher();
  const modal = useModal();

  const handleDelete = async () => {
    const confirmed = await modal.confirm({
      title: "Retirer le bonus ?",
      description: `Êtes-vous sûr de vouloir retirer "${bonus.name}" de cette sélection ?`,
      confirmText: "Retirer",
      cancelText: "Annuler",
      variant: "destructive",
    });

    if (!confirmed) return;

    fetcher.submit(
      { intent: "delete-bonus", bonusId: bonus.id },
      { method: "post" }
    );
  };

  return (
    <div className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{bonus.name}</h4>
            <Badge variant="outline" className="text-xs">{bonus.rarity}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{bonus.description}</p>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="font-mono">
              {availability.availableFrom}
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary" className="font-mono">
              {availability.availableUntil || "♾️"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============= Joker Section Component =============

function JokerSection({ jokerConfigs, allJokers }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const configuredJokerIds = new Set(
    jokerConfigs.map((c: any) => c.availability?.jokerId)
  );
  
  const availableJokers = allJokers.filter(
    (j: any) => !configuredJokerIds.has(j.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Jokers Disponibles</CardTitle>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add Form */}
        {isAdding && (
          <AddJokerForm
            availableJokers={availableJokers}
            onCancel={() => setIsAdding(false)}
            onSuccess={() => setIsAdding(false)}
          />
        )}

        {/* Configured Jokers List */}
        {jokerConfigs.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">Aucun joker configuré</p>
            <p className="text-sm">Cliquez sur "Ajouter" pour commencer</p>
          </div>
        ) : (
          jokerConfigs.map((config: any) => {
            const joker = config.joker;
            const availability = config.availability;
            if (!joker || !availability) return null;

            return editingId === availability.jokerId ? (
              <EditJokerForm
                key={availability.jokerId}
                joker={joker}
                availability={availability}
                onCancel={() => setEditingId(null)}
                onSuccess={() => setEditingId(null)}
              />
            ) : (
              <JokerCard
                key={availability.jokerId}
                joker={joker}
                availability={availability}
                onEdit={() => setEditingId(availability.jokerId)}
              />
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function AddJokerForm({ availableJokers, onCancel, onSuccess }: any) {
  const fetcher = useFetcher();
  const [selectedJokerId, setSelectedJokerId] = useState("");
  const [availableFrom, setAvailableFrom] = useState("1-1");
  const [availableUntil, setAvailableUntil] = useState("null");

  const handleSubmit = () => {
    fetcher.submit(
      {
        intent: "add-joker",
        jokerId: selectedJokerId,
        availableFrom,
        availableUntil,
      },
      { method: "post" }
    );
    onSuccess();
  };

  return (
    <div className="p-4 border-2 border-primary rounded-lg bg-primary/5 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">Ajouter un joker</h4>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs">Joker</Label>
          <Select value={selectedJokerId} onValueChange={setSelectedJokerId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un joker" />
            </SelectTrigger>
            <SelectContent>
              {availableJokers.map((joker: any) => (
                <SelectItem key={joker.id} value={joker.id}>
                  {joker.name} ({joker.rarity})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Disponible à partir de</Label>
            <Select value={availableFrom} onValueChange={setAvailableFrom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_IDS.map((level) => (
                  <SelectItem key={level} value={level}>
                    Niveau {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Disponible jusqu'à</Label>
            <Select value={availableUntil} onValueChange={setAvailableUntil}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">♾️ Toujours après</SelectItem>
                {LEVEL_IDS.map((level) => (
                  <SelectItem key={level} value={level}>
                    Niveau {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          size="sm" 
          className="w-full" 
          onClick={handleSubmit}
          disabled={!selectedJokerId}
        >
          <Check className="w-4 h-4 mr-2" />
          Confirmer
        </Button>
      </div>
    </div>
  );
}

function EditJokerForm({ joker, availability, onCancel, onSuccess }: any) {
  const fetcher = useFetcher();
  const [availableFrom, setAvailableFrom] = useState(availability.availableFrom);
  const [availableUntil, setAvailableUntil] = useState(availability.availableUntil || "null");

  const handleSubmit = () => {
    fetcher.submit(
      {
        intent: "edit-joker",
        jokerId: joker.id,
        availableFrom,
        availableUntil,
      },
      { method: "post" }
    );
    onSuccess();
  };

  return (
    <div className="p-4 border-2 border-primary rounded-lg bg-primary/5 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">{joker.name}</h4>
          <Badge variant="outline">{joker.rarity}</Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Disponible à partir de</Label>
          <Select value={availableFrom} onValueChange={setAvailableFrom}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_IDS.map((level) => (
                <SelectItem key={level} value={level}>
                  Niveau {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Disponible jusqu'à</Label>
          <Select value={availableUntil} onValueChange={setAvailableUntil}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">♾️ Toujours après</SelectItem>
              {LEVEL_IDS.map((level) => (
                <SelectItem key={level} value={level}>
                  Niveau {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button size="sm" className="w-full" onClick={handleSubmit}>
        <Check className="w-4 h-4 mr-2" />
        Sauvegarder
      </Button>
    </div>
  );
}

function JokerCard({ joker, availability, onEdit }: any) {
  const fetcher = useFetcher();
  const modal = useModal();

  const handleDelete = async () => {
    const confirmed = await modal.confirm({
      title: "Retirer le joker ?",
      description: `Êtes-vous sûr de vouloir retirer "${joker.name}" de cette sélection ?`,
      confirmText: "Retirer",
      cancelText: "Annuler",
      variant: "destructive",
    });

    if (!confirmed) return;

    fetcher.submit(
      { intent: "delete-joker", jokerId: joker.id },
      { method: "post" }
    );
  };

  return (
    <div className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{joker.name}</h4>
            <Badge variant="outline" className="text-xs">{joker.rarity}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{joker.description}</p>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="font-mono">
              {availability.availableFrom}
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary" className="font-mono">
              {availability.availableUntil || "♾️"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
