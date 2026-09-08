// Shared expense category definitions — icon + Tailwind swatch classes reuse the
// same design tokens as the rest of the app so every page stays visually consistent.
export const CATEGORIES = [
  {
    id: "housing",
    label: "Housing",
    icon: "home",
    chipBg: "bg-primary-fixed",
    chipText: "text-on-primary-fixed",
    dotBg: "bg-primary",
  },
  {
    id: "food",
    label: "Food & Dining",
    icon: "restaurant",
    chipBg: "bg-secondary-fixed",
    chipText: "text-on-secondary-fixed",
    dotBg: "bg-secondary",
  },
  {
    id: "transport",
    label: "Transportation",
    icon: "directions_car",
    chipBg: "bg-tertiary-fixed",
    chipText: "text-on-tertiary-fixed",
    dotBg: "bg-tertiary",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: "shopping_bag",
    chipBg: "bg-surface-container-high",
    chipText: "text-on-surface",
    dotBg: "bg-primary-container",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: "theaters",
    chipBg: "bg-primary-fixed",
    chipText: "text-on-primary-fixed",
    dotBg: "bg-secondary-container",
  },
  {
    id: "utilities",
    label: "Utilities",
    icon: "bolt",
    chipBg: "bg-error-container",
    chipText: "text-on-error-container",
    dotBg: "bg-error",
  },
  {
    id: "health",
    label: "Health",
    icon: "medical_services",
    chipBg: "bg-tertiary-fixed",
    chipText: "text-on-tertiary-fixed",
    dotBg: "bg-tertiary-container",
  },
  {
    id: "other",
    label: "Other",
    icon: "sell",
    chipBg: "bg-surface-container-high",
    chipText: "text-on-surface",
    dotBg: "bg-outline",
  },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}
