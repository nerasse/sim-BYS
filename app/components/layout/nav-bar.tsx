import { Link, useFetcher, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { cn } from "~/lib/utils";
import { Home, Settings, Gamepad2, TrendingUp, Save, Database, ChevronDown, Zap, Grid3X3 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import type { Preset } from "~/db/schema";

const resourceItems = [
  { href: "/resources/combinations", label: "Combinaisons" },
  { href: "/resources/bonuses", label: "Bonus" },
  { href: "/resources/jokers", label: "Jokers" },
  { href: "/resources/characters", label: "Personnages" },
  { href: "/resources/levels", label: "Niveaux" },
];

interface NavBarProps {
  activePreset: Preset | null;
  allPresets: Preset[];
}

export function NavBar({ activePreset, allPresets }: NavBarProps) {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      // Reload to update all data with new preset
      window.location.reload();
    }
  }, [fetcher.state, fetcher.data, navigate]);

  const handlePresetChange = (presetId: string) => {
    fetcher.submit(
      { presetId },
      { method: "post", action: "/api/set-active-preset" }
    );
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
              {/* Accueil */}
              <Link
                to="/"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Home className="w-4 h-4" />
                Accueil
              </Link>
              
              {/* Ressources Dropdown */}
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
                <DropdownMenuContent align="start" className="w-56">
                  {/* Éléments hard-codés */}
                  <DropdownMenuItem asChild>
                    <Link to="/effects" className="cursor-pointer flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Effets
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/resources/symbols" className="cursor-pointer flex items-center gap-2">
                      <Grid3X3 className="w-4 h-4" />
                      Symboles
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Séparateur */}
                  <DropdownMenuItem disabled className="cursor-default">
                    <div className="w-full border-t border-border my-1" />
                  </DropdownMenuItem>
                  
                  {/* Éléments modifiables */}
                  {resourceItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="cursor-pointer">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-px h-6 bg-border mx-2" />

              {/* Sélections */}
              <Link
                to="/resources/object-selections"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Settings className="w-4 h-4" />
                Sélections
              </Link>

              <div className="w-px h-6 bg-border mx-2" />

              {/* Presets */}
              <Link
                to="/presets"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Save className="w-4 h-4" />
                Presets
              </Link>

              <div className="w-px h-6 bg-border mx-2" />

              {/* Simulateur & Stats */}
              <Link
                to="/simulator"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Gamepad2 className="w-4 h-4" />
                Simulateur
              </Link>
              <Link
                to="/stats"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <TrendingUp className="w-4 h-4" />
                Stats
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            
            {activePreset && (
              <Link to="/config">
                <Button variant="ghost" size="icon" title="Configurer le preset">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

