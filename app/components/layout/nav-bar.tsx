import { Link } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { Home, Settings, Gamepad2, TrendingUp, Save } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import type { Preset } from "~/db/schema";

const navItems = [
  { href: "/", label: "Accueil", Icon: Home },
  { href: "/config/symbols", label: "Configuration", Icon: Settings },
  { href: "/simulator", label: "Simulateur", Icon: Gamepad2 },
  { href: "/stats", label: "Statistiques", Icon: TrendingUp },
  { href: "/presets", label: "Presets", Icon: Save },
];

interface NavBarProps {
  activePreset: Preset | null;
}

export function NavBar({ activePreset }: NavBarProps) {
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2"
            >
              <Gamepad2 className="w-6 h-6 text-primary" />
              BYS Simulator
            </Link>

            <div className="hidden md:flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                    "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activePreset ? (
              <Link to="/" className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Preset actif:</span>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  {activePreset.name}
                </Badge>
              </Link>
            ) : (
              <Link to="/">
                <Badge variant="destructive" className="cursor-pointer">
                  Aucun preset actif
                </Badge>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

