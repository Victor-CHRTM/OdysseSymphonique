import { useMemo } from "react";

function useTracks({ composition, currentStep, gamePhase, placedTracks }) {
  const unlockedTracks = useMemo(() => {
    if (!currentStep || gamePhase === "intro") return [];
    return currentStep.unlockedTracks;
  }, [currentStep, gamePhase]);

  const tracks = useMemo(() => {
    if (!composition) return [];

    const instrumentTracks = composition.instruments.map((instrument) => {
      const isPlaced = placedTracks.includes(instrument.id);

      return {
        id: instrument.id,
        type: isPlaced ? "label" : "audio",
        name: instrument.name,
        preview: instrument.audio.preview,
        locked: !unlockedTracks.includes(instrument.id) && !isPlaced,
        isTrap: false,
        isPlaced,
      };
    });

    const trapTracks = composition.trapTracks
      .filter((trap) => unlockedTracks.includes(trap.id))
      .map((trap) => ({
        id: trap.id,
        type: "audio",
        name: trap.name,
        preview: trap.audio.preview,
        locked: false,
        isTrap: true,
        isPlaced: false,
      }));

    return [...instrumentTracks, ...trapTracks].sort((a, b) => {
      if (a.isPlaced && !b.isPlaced) return -1;
      if (!a.isPlaced && b.isPlaced) return 1;
      if (a.locked === b.locked) return 0;
      return a.locked ? 1 : -1;
    });
  }, [composition, unlockedTracks, placedTracks]);

  return {
    tracks,
    unlockedTracks,
  };
}

export default useTracks;
