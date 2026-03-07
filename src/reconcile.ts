type DiffItem = {
  field: string;
  valA?: any;
  valB?: any;
};
export const reconcile = (objA: object, objB: object): DiffItem[] => {
  const result: DiffItem[] = [];
  const columnsA = Object.keys(objA);
  const columnsB = Object.keys(objB);

  const anyA = objA as { [cat: string]: any };
  const anyB = objB as { [cat: string]: any };
  for (const columnA of columnsA) {
    if (columnsB.includes(columnA)) {
      if (anyA[columnA] != anyB[columnA]) {
        result.push({
          field: columnA,
          valA: anyA[columnA],
          valB: anyB[columnA],
        });
      }
    } else {
      result.push({ field: columnA, valA: anyA[columnA] });
    }
  }
  for (const columnB of columnsB) {
    if (!columnsA.includes(columnB)) {
      result.push({ field: columnB, valB: anyB[columnB] });
    }
  }
  return result;
};

export type DiffDetail = {
  path: string;
  sourceValue: string;
  destinationValue: string;
};
const buildPath = (path: string, parentPath: string = '') => {
  if (!parentPath) return path;
  return parentPath + '::' + path;
};
export const reconcileDetail = (
  objA: object,
  objB: object,
  parentPath: string = '',
): DiffDetail[] => {
  const result: DiffDetail[] = [];
  const columnsA = Object.keys(objA);
  const columnsB = Object.keys(objB);

  const anyA = objA as { [cat: string]: any };
  const anyB = objB as { [cat: string]: any };

  for (const columnA of columnsA) {
    const path = buildPath(columnA, parentPath);
    if (columnsB.includes(columnA)) {
      if (anyA[columnA] != anyB[columnA]) {
        const valA = anyA[columnA];
        const valB = anyB[columnA];
        if (typeof valA == 'object' && typeof valB == 'object') {
          const subResult = reconcileDetail(
            valA,
            valB,
            buildPath(columnA, parentPath),
          );
          result.push(...subResult);
        } else {
          result.push({
            path: path,
            sourceValue: JSON.stringify(valA),
            destinationValue: JSON.stringify(valB),
          });
        }
      }
    } else {
      result.push({
        path: path,
        sourceValue: anyA[columnA],
        destinationValue: '',
      });
    }
  }
  for (const columnB of columnsB) {
    if (!columnsA.includes(columnB)) {
      const path = buildPath(columnB, parentPath);
      result.push({
        path: path,
        destinationValue: anyB[columnB],
        sourceValue: '',
      });
    }
  }
  return result;
};
