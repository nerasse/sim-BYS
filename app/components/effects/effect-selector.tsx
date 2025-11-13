import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Effect {
  id: string;
  name: string;
  displayName: string;
  type: string;
  unit: string | null;
  icon: string | null;
  target: string | null;
}

interface SelectedEffect {
  type: string;  // Nom de l'effet
  value: number;
  scalingPerLevel: number;
  maxLevel: number;
  target?: string;
}

interface EffectSelectorProps {
  availableEffects: Effect[];
  initialEffects: SelectedEffect[];
  onChange: (effects: SelectedEffect[]) => void;
}

export function EffectSelector({
  availableEffects,
  initialEffects,
  onChange,
}: EffectSelectorProps) {
  const [selectedEffects, setSelectedEffects] = useState<SelectedEffect[]>(initialEffects);

  useEffect(() => {
    onChange(selectedEffects);
  }, [selectedEffects]);

  const addEffect = () => {
    if (availableEffects.length > 0) {
      const firstEffect = availableEffects[0];
      setSelectedEffects([
        ...selectedEffects,
        {
          type: firstEffect.name,
          value: getDefaultValueForType(firstEffect.type),
          scalingPerLevel: 0,
          maxLevel: 1,
          target: firstEffect.target || undefined,
        },
      ]);
    }
  };

  // Helper function to get default value based on effect type
  const getDefaultValueForType = (type: string): number => {
    switch (type) {
      case "multiplier":
        return 1.0; // Neutral multiplier
      case "percentage":
        return 0.1; // 10%
      case "additive":
        return 10; // +10
      case "action":
      case "trigger":
        return 1; // Count-based effects
      default:
        return 1; // Default fallback
    }
  };

  const removeEffect = (index: number) => {
    setSelectedEffects(selectedEffects.filter((_, i) => i !== index));
  };

  const updateEffect = (index: number, field: keyof SelectedEffect, value: any) => {
    const updated = [...selectedEffects];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedEffects(updated);
  };

  return (
    <div className="space-y-3">
      {selectedEffects.map((selectedEffect, index) => {
        const effectDef = availableEffects.find((e) => e.name === selectedEffect.type);
        
        return (
          <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Effet</Label>
                <select
                  value={selectedEffect.type}
                  onChange={(e) => {
                    const newEffect = availableEffects.find((ef) => ef.name === e.target.value);
                    if (newEffect) {
                      updateEffect(index, "type", newEffect.name);
                      updateEffect(index, "value", getDefaultValueForType(newEffect.type));
                      if (newEffect.target) {
                        updateEffect(index, "target", newEffect.target);
                      }
                    }
                  }}
                  className="w-full h-9 px-3 py-2 border rounded-md"
                >
                  {availableEffects.map((effect) => (
                    <option key={effect.id} value={effect.name}>
                      {effect.icon ? `${effect.icon} ` : ""}{effect.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => removeEffect(index)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Valeur base {effectDef?.unit || ""}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={selectedEffect.value}
                  onChange={(e) => updateEffect(index, "value", parseFloat(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Scaling /niv</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={selectedEffect.scalingPerLevel}
                  onChange={(e) => updateEffect(index, "scalingPerLevel", parseFloat(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Max level</Label>
                <Input
                  type="number"
                  value={selectedEffect.maxLevel}
                  onChange={(e) => updateEffect(index, "maxLevel", parseInt(e.target.value))}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        );
      })}

      <Button type="button" size="sm" variant="outline" onClick={addEffect} className="w-full">
        <Plus className="w-3 h-3 mr-2" />
        Ajouter un effet
      </Button>

      {selectedEffects.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun effet sélectionné
        </p>
      )}
    </div>
  );
}

