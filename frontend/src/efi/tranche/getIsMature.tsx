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
