export const EFFECT_TYPES = [
  { value: "multiplier", label: "Multiplicateur", icon: "✖️" },
  { value: "additive", label: "Additif", icon: "➕" },
  { value: "percentage", label: "Pourcentage", icon: "📊" },
  { value: "fixed", label: "Fixe", icon: "📌" },
  { value: "conditional", label: "Conditionnel", icon: "❓" },
  { value: "scaling", label: "Progressif", icon: "📈" },
] as const;

export const EFFECT_UNITS = [
  { value: "x", label: "x (multiplicateur)" },
  { value: "%", label: "% (pourcentage)" },
  { value: "$", label: "$ (argent)" },
  { value: "pts", label: "pts (points)" },
  { value: "", label: "Sans unité" },
] as const;

export const EFFECT_CATEGORIES = [
  { value: "passive", label: "Passive", color: "bg-blue-500" },
  { value: "active", label: "Active", color: "bg-green-500" },
  { value: "trigger", label: "Trigger", color: "bg-purple-500" },
] as const;

export const EFFECT_TARGETS = [
  { value: "score", label: "Score", description: "Affecte les points de score (jetons)", icon: "🎯" },
  { value: "money", label: "Argent", description: "Affecte l'argent (dollars)", icon: "💰" },
  { value: "chance", label: "Chance", description: "Affecte les probabilités et la chance", icon: "🍀" },
  { value: "symbols", label: "Symboles", description: "Affecte les symboles sur la grille", icon: "🎰" },
  { value: "combos", label: "Combinaisons", description: "Affecte les combinaisons détectées", icon: "🔗" },
  { value: "shop", label: "Boutique", description: "Affecte la boutique (prix, rerolls)", icon: "🛒" },
  { value: "jokers", label: "Jokers", description: "Affecte les jokers possédés", icon: "🃏" },
  { value: "bonuses", label: "Bonus", description: "Affecte les bonus actifs", icon: "⭐" },
  { value: "character", label: "Personnage", description: "Affecte les stats du personnage", icon: "👤" },
  { value: "levels", label: "Niveaux", description: "Affecte la progression de niveau", icon: "📊" },
] as const;

