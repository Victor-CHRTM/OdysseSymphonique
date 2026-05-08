import { useEffect, useState } from "react";

function useLoadingScreen(duration = 1500) {
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return hasStarted;
}

export default useLoadingScreen;
