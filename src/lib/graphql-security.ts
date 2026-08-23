// GraphQL query depth and complexity limits

interface QueryNode {
  kind: string;
  selectionSet?: { selections: QueryNode[] };
}

export function calculateQueryDepth(query: string): number {
  // Simple depth calculation - count nested braces
  let depth = 0;
  let maxDepth = 0;
  
  for (const char of query) {
    if (char === '{') {
      depth++;
      maxDepth = Math.max(maxDepth, depth);
    } else if (char === '}') {
      depth--;
    }
  }
  
  return maxDepth;
}

export function validateQueryDepth(query: string, maxDepth: number = 10): void {
  const depth = calculateQueryDepth(query);
  if (depth > maxDepth) {
    throw new Error(`Query depth ${depth} exceeds maximum ${maxDepth}`);
  }
}

export function validateQueryComplexity(query: string, maxComplexity: number = 1000): void {
  if (query.length > 50000) {
    throw new Error('Query too large');
  }
  
  const fieldCount = (query.slice(0, 50000).match(/\w+\s*\{/g) || []).length;
  const depth = calculateQueryDepth(query);
  const complexity = fieldCount * depth;
  
  if (complexity > maxComplexity) {
    throw new Error(`Query complexity ${complexity} exceeds maximum ${maxComplexity}`);
  }
}

export function validateBatchQuery(query: string, maxAliases: number = 100): void {
  if (query.length > 50000) {
    throw new Error('Query too large');
  }
  
  const aliasCount = (query.slice(0, 50000).match(/\w+:/g) || []).length;
  if (aliasCount > maxAliases) {
    throw new Error(`Query has ${aliasCount} aliases, maximum is ${maxAliases}`);
  }
}
