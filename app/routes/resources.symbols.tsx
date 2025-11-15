import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllSymbols } from "~/db/queries/symbols";
import { PageHeader } from "~/components/layout/page-header";
import { Badge } from "~/components/ui/badge";

export const meta: MetaFunction = () => {
  return [
    { title: "Symboles - Ressources - Simulateur BYS" },
    { name: "description", content: "Bibliothèque globale des symboles (hard-codés)" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const symbols = await getAllSymbols();
  return json({ symbols });
}

const typeColors: Record<string, string> = {
  basic: "bg-gray-500",
  premium: "bg-blue-500",
  bonus: "bg-purple-500",
};

export default function ResourcesSymbols() {
  const { symbols } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Symboles"
          description="Bibliothèque globale des symboles disponibles dans le jeu (hard-codés)"
        />
      </div>

      <div className="border rounded-lg divide-y">
        {symbols.map((symbol) => (
          <SymbolListItem key={symbol.id} symbol={symbol} />
        ))}
      </div>
    </div>
  );
}

function SymbolListItem({ symbol }: { symbol: any }) {
  return (
    <div className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-4">
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
      </div>
    </div>
  );
}

