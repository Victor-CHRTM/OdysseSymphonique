import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
function DialogueBox({
  compositeur,
  content,
  onNext,
  showContinueHint,
  onAudioReferenceStart,
  onAudioReferenceStop,
  stopAudioSignal = 0,
}) {
  const playerRef = useRef(null);
  const playingAudioRef = useRef(null);
  const lastStopSignalRef = useRef(stopAudioSignal);
  const ignoreNextStopRef = useRef(false);

  const [playingAudio, setPlayingAudio] = useState(null);

  const stopAudio = useCallback(
    ({ shouldResume = true } = {}) => {
      const hadAudioPlaying = Boolean(playingAudioRef.current);

      if (playerRef.current) {
        ignoreNextStopRef.current = true;

        try {
          playerRef.current.stop();
        } catch {
          // ignore
        }

        playerRef.current.dispose();
        playerRef.current = null;

        setTimeout(() => {
          ignoreNextStopRef.current = false;
        }, 0);
      }

      playingAudioRef.current = null;
      setPlayingAudio(null);

      if (hadAudioPlaying && shouldResume) {
        onAudioReferenceStop?.();
      }
    },
    [onAudioReferenceStop],
  );

  const handlePlayAudioReference = async (audioSrc) => {
    if (playingAudioRef.current === audioSrc) {
      stopAudio({ shouldResume: true });
      return;
    }

    stopAudio({ shouldResume: false });
    onAudioReferenceStart?.();
    await Tone.start();

    const player = new Tone.Player({
      autostart: false,
      onstop: () => {
        if (ignoreNextStopRef.current) return;
        if (playingAudioRef.current !== audioSrc) return;

        playingAudioRef.current = null;
        playerRef.current = null;
        setPlayingAudio(null);

        onAudioReferenceStop?.();

        try {
          player.dispose();
        } catch {
          // ignore
        }
      },
    }).toDestination();

    playerRef.current = player;
    playingAudioRef.current = audioSrc;
    setPlayingAudio(audioSrc);

    try {
      await player.load(audioSrc);
      player.start();
    } catch (error) {
      console.error("Impossible de lire l'audio de dialogue :", error);

      playingAudioRef.current = null;
      playerRef.current = null;
      setPlayingAudio(null);

      try {
        player.dispose();
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (stopAudioSignal === lastStopSignalRef.current) return;

    lastStopSignalRef.current = stopAudioSignal;
    stopAudio({ shouldResume: false });
  }, [stopAudioSignal, stopAudio]);

  useEffect(() => {
    return () => {
      stopAudio({ shouldResume: false });
    };
  }, [stopAudio]);

  return (
    <div
      className={`dialogueBox ${onNext ? "dialogueBox--clickable" : ""}`}
      onClick={(event) => {
        if (event.target.closest("[data-dialogue-no-next]")) return;

        stopAudio({ shouldResume: true });
        onNext?.(event);
      }}
    >
      <div className="dialogueBox_name">{compositeur?.name}</div>

      {content.map((block, index) => {
        if (block.type === "text") {
          return <p key={index}>{block.text}</p>;
        }

        if (block.type === "audioReference") {
          const isPlaying = playingAudio === block.audio;

          return (
            <div key={index} className="dialogueBox_audioBlock">
              <p>{block.title}</p>

              <div className="dialogueBox_audioReference" data-dialogue-no-next>
                <img
                  src={block.image}
                  alt=""
                  className="dialogueBox_audioImage"
                />

                <p className="dialogueBox_audioText">{block.imgTexte}</p>

                <button
                  type="button"
                  className={`dialogueBox_audioPlay ${
                    isPlaying ? "is-playing" : ""
                  }`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handlePlayAudioReference(block.audio);
                  }}
                >
                  <img
                    src={
                      isPlaying
                        ? "/assets/images/ui/game/pause.png"
                        : "/assets/images/ui/game/play2.png"
                    }
                    alt={isPlaying ? "Mettre en pause" : "Lire l'extrait"}
                  />
                </button>
              </div>

              {block.sousTexte && <p>{block.sousTexte}</p>}
            </div>
          );
        }

        if (block.type === "finalAction") {
          return null;
        }

        return null;
      })}

      {showContinueHint && (
        <span className="dialogueBox_hint">
          {content?.some((block) => block.type === "finalAction")
            ? "Cliquez pour terminer l'aventure"
            : "Cliquez pour continuer"}
        </span>
      )}
    </div>
  );
}

export default DialogueBox;
