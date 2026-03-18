type PlainObject = Record<string, any>;

export function objectDeepAssign<T extends PlainObject>(target: T, source: Partial<T>): T {
  // Defensive guard: API erwartet Root-Objekte, keine Arrays.
  if (Array.isArray(target) || Array.isArray(source)) {
    throw new TypeError('objectDeepAssign erwartet Objekte als Root-Parameter');
  }

  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

    const sourceValue = (source as PlainObject)[key];
    const targetValue = (target as PlainObject)[key];

    (target as PlainObject)[key] = mergeNode(targetValue, sourceValue);
  }

  return target;
}

function mergeNode(targetValue: any, sourceValue: any): any {
  // Arrays nur intern behandeln (verschachtelte Knoten)
  if (Array.isArray(sourceValue)) {
    const targetArr = Array.isArray(targetValue) ? targetValue : [];
    return mergeArray(targetArr, sourceValue);
  }

  // Plain Objects rekursiv mergen
  if (isPlainObject(sourceValue)) {
    const base = isPlainObject(targetValue) ? targetValue : {};
    return objectDeepAssign(base, sourceValue);
  }

  // Primitive / null / Funktionen etc. überschreiben
  return sourceValue;
}

function mergeArray(targetArr: any[], sourceArr: any[]): any[] {
  // Vereint beide Längen: neue source-Elemente kommen dazu,
  // bestehende target-Reste bleiben erhalten.
  const maxLen = Math.max(targetArr.length, sourceArr.length);
  const result = new Array(maxLen);

  for (let i = 0; i < maxLen; i++) {
    const hasSource = i < sourceArr.length;

    if (!hasSource) {
      result[i] = targetArr[i];
      continue;
    }

    result[i] = mergeNode(targetArr[i], sourceArr[i]);
  }

  return result;
}

function isPlainObject(value: unknown): value is PlainObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}