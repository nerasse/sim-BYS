import { Link } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { Home, Settings, Gamepad2, TrendingUp, Save, Database, ChevronDown, Zap } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import type { Preset } from "~/db/schema";

const navItems = [
  { href: "/", label: "Accueil", Icon: Home },
  { href: "/config/symbols", label: "Configuration", Icon: Settings },
  { href: "/effects", label: "Effets", Icon: Zap },
  { href: "/simulator", label: "Simulateur", Icon: Gamepad2 },
  { href: "/stats", label: "Statistiques", Icon: TrendingUp },
  { href: "/presets", label: "Presets", Icon: Save },
];

const resourceItems = [
  { href: "/resources/symbols", label: "Symboles" },
  { href: "/resources/combinations", label: "Combinaisons" },
  { href: "/resources/bonuses", label: "Bonus" },
  { href: "/resources/jokers", label: "Jokers" },
  { href: "/resources/characters", label: "Personnages" },
  { href: "/resources/levels", label: "Niveaux" },
  { href: "/resources/object-selections", label: "Sélections d'Objets" },
];

interface NavBarProps {
  activePreset: Preset | null;
  allPresets: Preset[];
}

export function NavBar({ activePreset, allPresets }: NavBarProps) {
  const handlePresetChange = async (presetId: string) => {
    // Call API to change active preset
    await fetch("/api/set-active-preset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ presetId }),
    });
    
    // Reload the page to update all data
    window.location.reload();
  };

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

            <div className="hidden md:flex gap-1 items-center">
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Ressources
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {resourceItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="cursor-pointer">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {activePreset ? activePreset.name : "Aucun preset"}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {allPresets.map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    onClick={() => handlePresetChange(preset.id)}
                    className={
                      activePreset?.id === preset.id
                        ? "bg-accent font-medium"
                        : ""
                    }
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{preset.name}</span>
                      {preset.isFavorite && <span>⭐</span>}
                    </div>
                  </DropdownMenuItem>
                ))}
                {allPresets.length === 0 && (
                  <DropdownMenuItem disabled>
                    Aucun preset disponible
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

