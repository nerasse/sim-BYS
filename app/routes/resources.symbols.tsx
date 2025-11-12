import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getAllSymbols, createSymbol, updateSymbol, deleteSymbol } from "~/db/queries/symbols";
import { PageHeader } from "~/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Symboles - Ressources - Simulateur BYS" },
    { name: "description", content: "Bibliothèque globale des symboles" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const symbols = await getAllSymbols();
  return json({ symbols });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const name = formData.get("name") as string;
    const type = formData.get("type") as "basic" | "premium" | "bonus";
    const baseWeight = parseFloat(formData.get("baseWeight") as string);
    const baseValue = parseInt(formData.get("baseValue") as string);
    const baseMultiplier = parseFloat(formData.get("baseMultiplier") as string);

    await createSymbol({
      name,
      type,
      baseWeight,
      baseValue,
      baseMultiplier,
    });

    return json({ success: true });
  }

  if (intent === "update") {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const baseWeight = parseFloat(formData.get("baseWeight") as string);
    const baseValue = parseInt(formData.get("baseValue") as string);
    const baseMultiplier = parseFloat(formData.get("baseMultiplier") as string);

    await updateSymbol(id, {
      name,
      baseWeight,
      baseValue,
      baseMultiplier,
    });

    return json({ success: true });
  }

  if (intent === "delete") {
    const id = formData.get("id") as string;
    await deleteSymbol(id);
    return json({ success: true });
  }

  return json({ success: false });
}

const typeColors: Record<string, string> = {
  basic: "bg-gray-500",
  premium: "bg-blue-500",
  bonus: "bg-purple-500",
};

export default function ResourcesSymbols() {
  const { symbols } = useLoaderData<typeof loader>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Symboles"
          description="Bibliothèque globale des symboles disponibles dans le jeu"
        />
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un symbole
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <SymbolForm
          onCancel={() => setShowCreateForm(false)}
          intent="create"
        />
      )}

      <div className="border rounded-lg divide-y">
        {symbols.map((symbol) => (
          <div key={symbol.id}>
            {editingId === symbol.id ? (
              <SymbolForm
                symbol={symbol}
                onCancel={() => setEditingId(null)}
                intent="update"
              />
            ) : (
              <SymbolListItem
                symbol={symbol}
                onEdit={() => setEditingId(symbol.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SymbolListItem({ symbol, onEdit }: { symbol: any; onEdit: () => void }) {
  const fetcher = useFetcher();

  const handleDelete = () => {
    if (confirm(`Supprimer le symbole "${symbol.name}" ?`)) {
      fetcher.submit(
        { intent: "delete", id: symbol.id },
        { method: "post" }
      );
    }
  };

  return (
    <div className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">{symbol.name}</h3>
            <Badge className={typeColors[symbol.type]}>
              {symbol.type}
            </Badge>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Poids:</span>
              <span className="font-medium">{symbol.baseWeight}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Valeur:</span>
              <span className="font-medium">{symbol.baseValue}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Multiplicateur:</span>
              <span className="font-medium">×{symbol.baseMultiplier}</span>
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

function SymbolForm({
  symbol,
  onCancel,
  intent,
}: {
  symbol?: any;
  onCancel: () => void;
  intent: "create" | "update";
}) {
  const fetcher = useFetcher();

  const isSubmitting = fetcher.state !== "idle";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{intent === "create" ? "Nouveau symbole" : "Modifier"}</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form method="post" className="space-y-4" onSubmit={() => {
          setTimeout(onCancel, 100);
        }}>
          <input type="hidden" name="intent" value={intent} />
          {intent === "update" && <input type="hidden" name="id" value={symbol?.id} />}

          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              name="name"
              defaultValue={symbol?.name}
              required
            />
          </div>

          {intent === "create" && (
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue={symbol?.type || "basic"}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="bonus">Bonus</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="baseWeight">Poids</Label>
            <Input
              id="baseWeight"
              name="baseWeight"
              type="number"
              step="0.1"
              defaultValue={symbol?.baseWeight || 1}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseValue">Valeur</Label>
            <Input
              id="baseValue"
              name="baseValue"
              type="number"
              defaultValue={symbol?.baseValue || 1}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseMultiplier">Multiplicateur</Label>
            <Input
              id="baseMultiplier"
              name="baseMultiplier"
              type="number"
              step="0.1"
              defaultValue={symbol?.baseMultiplier || 1}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
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

