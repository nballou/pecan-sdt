// Categorical palette — avoids semantic colors (green=positive, red=negative/highlight, gray=unconnected)
export const CONSTRUCT_COLORS = [
  '#4e79a7', // blue
  '#f28e2b', // orange
  '#b07aa1', // purple
  '#d5a12b', // amber/gold
  '#3a9ca0', // dark teal
  '#e377c2', // pink
  '#8c564b', // brown
  '#7b68ee', // medium slate blue
]

export const getNodeColor = (nodeId: any, allNodes: any[]): string => {
  const idx = allNodes.findIndex((n: any) => n.id == nodeId)
  return CONSTRUCT_COLORS[Math.max(0, idx) % CONSTRUCT_COLORS.length]
}
