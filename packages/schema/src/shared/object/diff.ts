type DiffItem = {
  field: string
  valA?: any
  valB?: any
}

/**
 * Calculates the differences between two objects and returns an array of changes.
 *
 * @param objA The source object.
 *
 * @param objB The target object to compare against.
 *
 * @returns An array of diff items representing fields that differ between the two objects.
 */
export const reconcile = (objA: object, objB: object): Array<DiffItem> => {
  const result: Array<DiffItem> = []
  const columnsA = Object.keys(objA)
  const columnsB = Object.keys(objB)

  const anyA = objA as { [cat: string]: any }
  const anyB = objB as { [cat: string]: any }
  for (const columnA of columnsA) {
    if (columnsB.includes(columnA)) {
      if (anyA[columnA] != anyB[columnA]) {
        result.push({
          field: columnA,
          valA: anyA[columnA],
          valB: anyB[columnA],
        })
      }
    } else {
      result.push({ field: columnA, valA: anyA[columnA] })
    }
  }
  for (const columnB of columnsB) {
    if (!columnsA.includes(columnB)) {
      result.push({ field: columnB, valB: anyB[columnB] })
    }
  }
  return result
}

/**
 * Represents a specific difference between two objects, including the path and value changes.
 */
export type DiffDetail = {
  /**
   * The object path to the property that differs.
   */
  path: string

  /**
   * The value of the property in the source object.
   */
  sourceValue: string

  /**
   * The value of the property in the destination object.
   */
  destinationValue: string
}
const buildPath = (path: string, parentPath: string = '') => {
  if (!parentPath) return path
  return parentPath + '::' + path
}

/**
 * Recursively calculates differences between two objects and returns detailed change descriptions.
 *
 * @param objA The source object.
 *
 * @param objB The destination object to compare against.
 *
 * @param parentPath The initial path prefix for recursive calls.
 *
 * @returns An array of detailed diffs showing path and value changes.
 */
export const reconcileDetail = (
  objA: object,
  objB: object,
  parentPath: string = '',
): Array<DiffDetail> => {
  const result: Array<DiffDetail> = []
  const columnsA = Object.keys(objA)
  const columnsB = Object.keys(objB)

  const anyA = objA as { [cat: string]: any }
  const anyB = objB as { [cat: string]: any }

  for (const columnA of columnsA) {
    const path = buildPath(columnA, parentPath)
    if (columnsB.includes(columnA)) {
      if (anyA[columnA] != anyB[columnA]) {
        const valA = anyA[columnA]
        const valB = anyB[columnA]
        if (typeof valA == 'object' && typeof valB == 'object') {
          const subResult = reconcileDetail(valA, valB, buildPath(columnA, parentPath))
          result.push(...subResult)
        } else {
          result.push({
            path: path,
            sourceValue: JSON.stringify(valA),
            destinationValue: JSON.stringify(valB),
          })
        }
      }
    } else {
      result.push({
        path: path,
        sourceValue: anyA[columnA],
        destinationValue: '',
      })
    }
  }
  for (const columnB of columnsB) {
    if (!columnsA.includes(columnB)) {
      const path = buildPath(columnB, parentPath)
      result.push({
        path: path,
        destinationValue: anyB[columnB],
        sourceValue: '',
      })
    }
  }
  return result
}
