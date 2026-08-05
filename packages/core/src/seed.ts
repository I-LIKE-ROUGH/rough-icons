export function hash32(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0 || 1;
}

export function resolveIconSeed(
  iconName: string,
  seed?: string | number,
): number {
  if (typeof seed === 'number')
    return Math.max(1, Math.abs(Math.trunc(seed)) % 0x7fffffff);
  return hash32(
    seed === undefined ? `editorial-v1:${iconName}` : `${iconName}:${seed}`,
  );
}
