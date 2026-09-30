/**
 * Categorical route colors for landing-page illustrations, always assigned in this order.
 * Drawn from the app's bus palette minus the status hues (emerald = on-time, amber = delayed),
 * and checked with the dataviz palette validator in light and dark mode (all checks pass).
 * Routes are always text-labelled too, so color is never the only cue.
 */
export const ROUTE_COLORS = ['#3B82F6', '#DB2777', '#0891B2', '#8B5CF6'] as const

export function routeColor(index: number): string {
  return ROUTE_COLORS[index % ROUTE_COLORS.length] ?? ROUTE_COLORS[0]
}
