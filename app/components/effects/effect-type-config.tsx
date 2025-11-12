import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useState, useEffect } from "react";

interface EffectTypeConfigProps {
  type: string;
  initialConfig?: any;
  onChange: (config: any) => void;
}

export function EffectTypeConfig({ type, initialConfig, onChange }: EffectTypeConfigProps) {
  const [config, setConfig] = useState(initialConfig || {});

  useEffect(() => {
    onChange(config);
  }, [config]);

  const updateField = (field: string, value: any) => {
    setConfig({ ...config, [field]: value });
  };

  // Multiplier, Additive, Percentage, Fixed : juste defaultValue (déjà géré)
  if (["multiplier", "additive", "percentage", "fixed"].includes(type)) {
    return (
      <div className="p-3 bg-muted/20 rounded border">
        <p className="text-xs text-muted-foreground">
          Utilisez le champ "Valeur défaut" ci-dessus pour ce type.
        </p>
      </div>
    );
  }

  // Conditional : condition + valeur
  if (type === "conditional") {
    return (
      <div className="space-y-3 p-3 bg-muted/20 rounded border">
        <p className="text-xs font-medium">⚙️ Configuration Conditionnel</p>
        
        <div className="space-y-2">
          <Label className="text-xs">Condition (expression)</Label>
          <Input
            placeholder="ex: symbol.type === 'premium'"
            value={config.condition || ""}
            onChange={(e) => updateField("condition", e.target.value)}
            className="h-9 text-sm font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Expression JavaScript évaluée pendant le jeu
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Description de la condition</Label>
          <Input
            placeholder="ex: Si symbole premium"
            value={config.conditionDescription || ""}
            onChange={(e) => updateField("conditionDescription", e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>
    );
  }

  // Scaling : base + increment + max
  if (type === "scaling") {
    return (
      <div className="space-y-3 p-3 bg-muted/20 rounded border">
        <p className="text-xs font-medium">⚙️ Configuration Progressif</p>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">Valeur de base</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="1.0"
              value={config.baseValue || ""}
              onChange={(e) => updateField("baseValue", parseFloat(e.target.value))}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Increment / niveau</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.1"
              value={config.increment || ""}
              onChange={(e) => updateField("increment", parseFloat(e.target.value))}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Valeur max</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="10"
              value={config.maxValue || ""}
              onChange={(e) => updateField("maxValue", parseFloat(e.target.value))}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Formule : <code className="bg-muted px-1 rounded">valeur = base + (niveau × increment)</code> (plafonné à max)
        </p>

        {config.baseValue && config.increment && (
          <div className="text-xs space-y-1 p-2 bg-background rounded">
            <p className="font-medium">Aperçu :</p>
            <p>Niveau 1: {(config.baseValue + 1 * config.increment).toFixed(2)}</p>
            <p>Niveau 5: {Math.min((config.baseValue + 5 * config.increment), config.maxValue || Infinity).toFixed(2)}</p>
            <p>Niveau 10: {Math.min((config.baseValue + 10 * config.increment), config.maxValue || Infinity).toFixed(2)}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

