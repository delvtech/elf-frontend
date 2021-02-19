import conformsTo from "lodash.conformsto";
import mapValues from "lodash.mapvalues";

export function hasSameKeys<T1 extends object, T2 extends object>(
  doesThisObject: T1,
  matchThisObject: T2
): boolean {
  const sourcePredicates = mapValues(
    matchThisObject,
    (_unusedValue, thisObjectKey) => () =>
      doesThisObject.hasOwnProperty(thisObjectKey)
  );
  const conforms = conformsTo(matchThisObject, sourcePredicates);
  return conforms;
}
