import { useEffect, useRef } from 'react';

/**
 * Mirrors a value into a ref so long-lived callbacks — timers, listeners — can
 * read the current value without being rebuilt every time it changes.
 *
 * The ref is written in an effect, so it is *not* safe for values that must be
 * visible in the same tick as the state update that changed them. Those keep
 * writing their ref at the mutation site.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}
