import { useMemo } from "react";

export const useSeededHslColor = (seed: string, l = "20%") => {
  const hsl = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    let h = hash % 360;

    return `hsl(${h}, 100%, ${l})`;
  }, [seed]);

  return hsl;
};
