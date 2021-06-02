/**
 * @deprecated Date objects are heavy and maturation dates should never be
 * undefined thanks to tokenlists, use getIsMature2 instead
 */
export function getIsMature(maturationDate: Date | undefined): boolean {
  if (!maturationDate) {
    return false;
  }
  const now = Date.now();
  if (now >= maturationDate.getTime()) {
    return true;
  }
  return false;
}

export function getIsMature2(unlockTimestamp: number): boolean {
  const now = Date.now();
  if (now >= unlockTimestamp * 1000) {
    return true;
  }
  return false;
}
