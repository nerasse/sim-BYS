import { Outlet, Link, useLocation } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { Shapes, Target, Gift, Sparkles, User, BarChart3, Store } from "lucide-react";

const configSections = [
  { href: "/config/symbols", label: "Symboles", Icon: Shapes },
  { href: "/config/combos", label: "Combinaisons", Icon: Target },
  { href: "/config/bonuses", label: "Bonus", Icon: Gift },
  { href: "/config/jokers", label: "Jokers", Icon: Sparkles },
  { href: "/config/characters", label: "Personnages", Icon: User },
  { href: "/config/levels", label: "Niveaux", Icon: BarChart3 },
  { href: "/config/shop-rarities", label: "Raretés Boutique", Icon: Store },
];

export default function ConfigLayout() {
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
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

