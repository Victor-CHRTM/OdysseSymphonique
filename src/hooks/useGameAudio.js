import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";

function useGameAudio({
  composition,
  tracks,
  placedTracks,
  currentTime,
  setCurrentTime,
}) {
  const previewPlayersRef = useRef({});
  const completePlayersRef = useRef({});
  const wasPlayingBeforePreviewRef = useRef(false);
  const preventPreviewResumeRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreviewId, setActivePreviewId] = useState(null);
  const [instrumentVolumes, setInstrumentVolumes] = useState({});
  const [mutedInstruments, setMutedInstruments] = useState([]);

  const safeStopPlayer = useCallback((player) => {
    try {
      player.stop();
    } catch {
      // Tone.js peut throw si stop est appelé avant start.
    }
  }, []);

  const getInstrumentVolume = useCallback(
    (instrumentId) => instrumentVolumes[instrumentId] ?? 70,
    [instrumentVolumes],
  );

  const isInstrumentMuted = useCallback(
    (instrumentId) => {
      const volume = getInstrumentVolume(instrumentId);
      return mutedInstruments.includes(instrumentId) || volume === 0;
    },
    [getInstrumentVolume, mutedInstruments],
  );

  const getToneVolume = useCallback(
    (instrumentId) => {
      const volume = getInstrumentVolume(instrumentId);
      const isPlaced = placedTracks.includes(instrumentId);
      const muted = isInstrumentMuted(instrumentId);

      if (!isPlaced || muted || volume === 0) return -100;

      return Tone.gainToDb(volume / 100);
    },
    [getInstrumentVolume, isInstrumentMuted, placedTracks],
  );

  const pauseGlobalTimeline = useCallback(() => {
    Tone.Transport.pause();
    setIsPlaying(false);
  }, []);

  const resumeGlobalTimeline = useCallback(() => {
    if (!composition) return;
    if (Tone.Transport.seconds >= composition.duration) return;

    Tone.Transport.start();
    setIsPlaying(true);
  }, [composition]);

  const resetGlobalTimeline = useCallback(() => {
    Tone.Transport.pause();
    Tone.Transport.seconds = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }, [setCurrentTime]);

  const stopAllPreviews = useCallback(() => {
    preventPreviewResumeRef.current = true;

    Object.values(previewPlayersRef.current).forEach((player) => {
      safeStopPlayer(player);
    });

    preventPreviewResumeRef.current = false;
    wasPlayingBeforePreviewRef.current = false;
    setActivePreviewId(null);
  }, [safeStopPlayer]);

  const toggleGlobalPlay = useCallback(async () => {
    if (!composition) return;

    await Tone.start();

    stopAllPreviews();

    if (isPlaying) {
      Tone.Transport.pause();
      setIsPlaying(false);
      return;
    }

    const nextStartTime = currentTime >= composition.duration ? 0 : currentTime;

    Tone.Transport.seconds = nextStartTime;
    setCurrentTime(nextStartTime);

    Tone.Transport.start();
    setIsPlaying(true);
  }, [composition, currentTime, isPlaying, setCurrentTime, stopAllPreviews]);

  const handlePlayPreview = useCallback(
    async (trackId) => {
      const track = tracks.find((trackItem) => trackItem.id === trackId);

      const isTutorialPreview =
        track.id ===
        tracks.find((item) => !item.isTrap && item.type === "audio")?.id;

      if (!track || track.type === "label") return;
      if (track.locked && !isTutorialPreview) return;

      await Tone.start();

      const player = previewPlayersRef.current[trackId];

      if (!player) return;

      if (activePreviewId === trackId) {
        safeStopPlayer(player);
        setActivePreviewId(null);

        if (wasPlayingBeforePreviewRef.current) {
          resumeGlobalTimeline();
          wasPlayingBeforePreviewRef.current = false;
        }

        return;
      }

      wasPlayingBeforePreviewRef.current = isPlaying;

      if (isPlaying) {
        Tone.Transport.pause();
        setIsPlaying(false);
      }

      preventPreviewResumeRef.current = true;

      Object.entries(previewPlayersRef.current).forEach(
        ([id, previewPlayer]) => {
          if (id !== trackId) safeStopPlayer(previewPlayer);
        },
      );

      preventPreviewResumeRef.current = false;

      safeStopPlayer(player);
      player.start();

      setActivePreviewId(trackId);
    },
    [activePreviewId, isPlaying, resumeGlobalTimeline, safeStopPlayer, tracks],
  );

  const handleToggleInstrumentMute = useCallback((instrumentId) => {
    setMutedInstruments((prev) => {
      if (prev.includes(instrumentId)) {
        return prev.filter((id) => id !== instrumentId);
      }

      return [...prev, instrumentId];
    });
  }, []);

  const handleChangeInstrumentVolume = useCallback((instrumentId, volume) => {
    const nextVolume = Number(volume);

    setInstrumentVolumes((prev) => ({
      ...prev,
      [instrumentId]: nextVolume,
    }));

    if (nextVolume > 0) {
      setMutedInstruments((prev) => prev.filter((id) => id !== instrumentId));
    }
  }, []);

  useEffect(() => {
    previewPlayersRef.current = {};

    tracks.forEach((track) => {
      if (!track.preview || track.type === "label") return;

      const player = new Tone.Player({
        url: track.preview,
        autostart: false,
        onstop: () => {
          setActivePreviewId((currentActiveId) => {
            if (currentActiveId !== track.id) return currentActiveId;

            if (
              wasPlayingBeforePreviewRef.current &&
              !preventPreviewResumeRef.current
            ) {
              resumeGlobalTimeline();
              wasPlayingBeforePreviewRef.current = false;
            }

            return null;
          });
        },
      }).toDestination();

      previewPlayersRef.current[track.id] = player;
    });

    return () => {
      Object.values(previewPlayersRef.current).forEach((player) => {
        safeStopPlayer(player);
        player.dispose();
      });

      previewPlayersRef.current = {};
      setActivePreviewId(null);
    };
  }, [resumeGlobalTimeline, safeStopPlayer, tracks]);

  useEffect(() => {
    if (!composition) return;

    completePlayersRef.current = {};

    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.seconds = 0;

    composition.instruments.forEach((instrument) => {
      if (!instrument.audio.complete) return;

      const player = new Tone.Player({
        url: instrument.audio.complete,
        autostart: false,
      }).toDestination();

      player.volume.value = -100;
      player.sync().start(0);

      completePlayersRef.current[instrument.id] = player;
    });

    return () => {
      Object.values(completePlayersRef.current).forEach((player) => {
        try {
          player.unsync();
        } catch {
          // ignore
        }

        player.dispose();
      });

      completePlayersRef.current = {};

      Tone.Transport.stop();
      Tone.Transport.cancel();
      Tone.Transport.seconds = 0;
    };
  }, [composition]);

  useEffect(() => {
    Object.entries(completePlayersRef.current).forEach(
      ([instrumentId, player]) => {
        player.volume.value = getToneVolume(instrumentId);
      },
    );
  }, [getToneVolume]);

  useEffect(() => {
    if (!isPlaying || !composition) return;

    const interval = setInterval(() => {
      const transportTime = Tone.Transport.seconds;

      if (transportTime >= composition.duration) {
        Tone.Transport.pause();
        Tone.Transport.seconds = composition.duration;

        setCurrentTime(composition.duration);
        setIsPlaying(false);
        return;
      }

      setCurrentTime(transportTime);
    }, 100);

    return () => clearInterval(interval);
  }, [composition, isPlaying, setCurrentTime]);

  return {
    isPlaying,
    activePreviewId,

    getInstrumentVolume,
    isInstrumentMuted,

    handlePlayPreview,
    toggleGlobalPlay,

    pauseGlobalTimeline,
    resumeGlobalTimeline,
    resetGlobalTimeline,

    stopAllPreviews,

    handleToggleInstrumentMute,
    handleChangeInstrumentVolume,
  };
}

export default useGameAudio;
