import { useCallback, useRef } from 'react';

export const useDebounce = (delay = 500) => {
  const timeoutRef = useRef(null);

  const debouncedFunction = useCallback((callback) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, [delay]);

  return debouncedFunction;
};
