export function assertNever(never: never) {
  throw new Error(`Was not never: ${never}`);
}
