export const flattenObjectToKeyValuePairs = (obj, parentKey = "") => {
  const result = [];

  for (const [key, value] of Object.entries(obj)) {
    const path = parentKey ? `${parentKey}.${key}` : key;

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      // Recursively flatten nested objects
      result.push(...flattenObjectToKeyValuePairs(value, path));
    } else if (Array.isArray(value) || typeof value === "object") {
      // Stringify arrays or objects directly
      result.push([path, JSON.stringify(value)]);
    } else {
      // Primitive value
      result.push([path, value]);
    }
  }

  return result;
};
