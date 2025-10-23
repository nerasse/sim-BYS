import { Form } from "@remix-run/react";
import type { Preset } from "~/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Settings } from "lucide-react";

interface PresetSelectorProps {
  presets: Preset[];
  activePresetId: string;
}

export function PresetSelector({
  presets,
  activePresetId,
}: PresetSelectorProps) {
  const activePreset = presets.find((p) => p.id === activePresetId);

  const handleChange = (value: string) => {
    // Soumet le form quand la valeur change
    const form = document.getElementById(
      "preset-selector-form"
    ) as HTMLFormElement;
    if (form) {
      const input = form.querySelector('input[name="presetId"]') as HTMLInputElement;
      if (input) {
        input.value = value;
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Settings className="h-4 w-4" />
        <span className="font-medium">Preset actif:</span>
      </div>
      <Form
        method="post"
        action="/api/set-active-preset"
        id="preset-selector-form"
        className="flex-1"
      >
        <input type="hidden" name="presetId" value={activePresetId} />
        <Select value={activePresetId} onValueChange={handleChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un preset">
              {activePreset?.name || "Aucun preset actif"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
                {preset.isFavorite && " ⭐"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Form>
    </div>
  );
}

