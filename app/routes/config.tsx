import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, Link, useLocation, useLoaderData } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { Shapes, Target, Gift, Sparkles, User, BarChart3, Store, Package } from "lucide-react";
import { getAllPresets } from "~/db/queries/presets";
import { getActivePreset } from "~/db/queries/active-preset";
import { PresetSelector } from "~/components/presets/preset-selector";

const configSections = [
  { href: "/config/symbols", label: "Symboles", Icon: Shapes },
  { href: "/config/combos", label: "Combinaisons", Icon: Target },
  { href: "/config/levels", label: "Niveaux", Icon: BarChart3 },
  { href: "/config/shop-rarities", label: "Raretés Boutique", Icon: Store },
  { href: "/config/preset-settings", label: "Paramètres du Preset", Icon: Package },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const [presets, activePresetData] = await Promise.all([
    getAllPresets(),
    getActivePreset(),
  ]);

  if (!activePresetData?.presetId) {
    throw new Response("No active preset found", { status: 404 });
  }

  return json({
    presets,
    activePresetId: activePresetData.presetId,
  });
}

export default function ConfigLayout() {
  const { presets, activePresetId } = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <div className="sticky top-4 space-y-1">
          <h2 className="px-4 py-2 text-lg font-semibold">Configuration</h2>
          <nav className="space-y-1">
            {configSections.map((section) => {
              const isActive = location.pathname === section.href;
              return (
                <Link
                  key={section.href}
                  to={section.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <section.Icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 space-y-6">
        {/* Preset Selector */}
        <PresetSelector presets={presets} activePresetId={activePresetId} />
        
        {/* Page content */}
        <Outlet />
      </main>
    </div>
  );
}

