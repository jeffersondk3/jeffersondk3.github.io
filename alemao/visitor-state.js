// O treino de visitantes existe apenas nesta página; não usa armazenamento do navegador.
export function createVisitorStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(String(key)) ?? null,
    setItem: (key, value) => values.set(String(key), String(value)),
    removeItem: key => values.delete(String(key)),
    clear: () => values.clear()
  };
}
export const emptyVisitorProgress = () => ({done: [], favorites: [], last: 1});
export const hasPrivateProfile = cloud => Boolean(cloud?.userId);
