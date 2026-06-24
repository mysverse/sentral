export function normalizeNumericIds(values: Iterable<number>): number[] {
  return Array.from(
    new Set(
      Array.from(values).filter((id) => Number.isSafeInteger(id) && id > 0)
    )
  ).sort((a, b) => a - b);
}

export function avatarCacheKey(type: "headshot" | "bust", size: number) {
  return `cache:v2:avatars:${type}:${size}`;
}

export function mergeCachedByNumericId<T>(
  ids: number[],
  cached: Array<T | null>,
  fetched: T[],
  getId: (item: T) => number
): T[] {
  const fetchedById = new Map(fetched.map((item) => [getId(item), item]));
  return ids.flatMap((id, index) => {
    const item = cached[index] ?? fetchedById.get(id);
    return item ? [item] : [];
  });
}
