export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> => {
  const result: Partial<T> = {};
  keys.forEach((key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  });

  return result;
};
