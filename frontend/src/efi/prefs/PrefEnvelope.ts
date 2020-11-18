export interface PrefEnvelope<T> {
  pref: T;
}

/**
 * Use an envelope because JSON.stringify likes serializable objects and prefs
 * could be anything
 */
export function makePrefEnvelope<T>(pref: T): PrefEnvelope<T> {
  return { pref };
}
