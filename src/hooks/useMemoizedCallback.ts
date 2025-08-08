import { useCallback, useRef } from 'react';

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  const ref = useRef<T>();
  
  return useCallback(((...args) => {
    if (!ref.current) {
      ref.current = callback;
    }
    return ref.current(...args);
  }) as T, dependencies);
}