export const toCamelCase = (value) => {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(toCamelCase);
  if (typeof value !== 'object') return value;

  return Object.entries(value).reduce((acc, [key, item]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(item);
    return acc;
  }, {});
};
