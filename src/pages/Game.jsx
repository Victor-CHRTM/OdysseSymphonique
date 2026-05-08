import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

import Menu from "../components/TopBar";
import TrackPanel from "../components/TrackPanel";
import TrackCard from "../components/TrackCard";
import ComposerPanel from "../components/ComposerPanel";
import DialogueBox from "../components/DialogueBox";
import TimerRewardsPanel from "../components/TimerRewardsPanel";
import InstrumentZone from "../components/InstrumentZone";
import BioModal from "../components/BioModal";
import VictoryScreen from "../components/VictoryScreen";
import Tutorial from "../components/Tutorial";
import TutorialOverlay from "../components/TutorialOverlay";

import useGameAudio from "../hooks/useGameAudio";
import useGameFlow from "../hooks/useGameFlow";
import useLoadingScreen from "../hooks/useLoadingScreen";
import useTracks from "../hooks/useTracks";
import useDialogueContent from "../hooks/useDialogueContent";

import compositions from "../data/compositions.json";
import compositeurs from "../data/compositeurs.json";
import parcoursData from "../data/parcours.json";
import instrumentsData from "../data/instruments.json";
import tutorialSteps from "../data/tutorial.json";

const TUTORIAL_STORAGE_KEY = "odyssee_tutorial_done";

function Game() {
  const { compositionId } = useParams();

  const composition = compositions.find((comp) => comp.id === compositionId);
  const compositeur = compositeurs.find(
    (c) => c.id === composition?.composerId,
  );
  const parcours = parcoursData.find(
    (p) => p.compositionId === composition?.id,
  );

  const hasStarted = useLoadingScreen();

  const [currentTime, setCurrentTime] = useState(0);
  const [draggedTrack, setDraggedTrack] = useState(null);

  const [tutorialMode, setTutorialMode] = useState(null);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(null);
  const [tutorialTextIndex, setTutorialTextIndex] = useState(0);

  const currentTutorialStep =
    tutorialStepIndex !== null ? tutorialSteps[tutorialStepIndex] : null;

  const isTutorialTracksStep = currentTutorialStep?.id === "tracks";
  const isTutorialSceneStep = currentTutorialStep?.id === "scene";
  const isTutorialRunning = tutorialStepIndex !== null;

  const tutorialTrackPhase = isTutorialTracksStep ? tutorialTextIndex : null;

  const [dialogueAudioStopSignal, setDialogueAudioStopSignal] = useState(0);
  const wasPlayingBeforeDialogueAudioRef = useRef(false);

  const flow = useGameFlow({ parcours });

  const firstTutorialInstrumentId =
    parcours?.steps?.[0]?.validAnswers?.[0] ||
    composition?.instruments?.[0]?.id;

  const shouldShowTutorialPlacedInstrument =
    isTutorialSceneStep && tutorialTextIndex >= 1 && firstTutorialInstrumentId;

  const shouldShowTutorialInstrumentInfo =
    isTutorialSceneStep && tutorialTextIndex >= 2 && firstTutorialInstrumentId;

  const displayedPlacedTracks = shouldShowTutorialPlacedInstrument
    ? [firstTutorialInstrumentId]
    : flow.placedTracks;

  const displayedSelectedInstrumentId = shouldShowTutorialInstrumentInfo
    ? firstTutorialInstrumentId
    : flow.selectedInstrumentId;

  const { tracks } = useTracks({
    composition,
    currentStep: flow.currentStep,
    gamePhase: flow.gamePhase,
    placedTracks: displayedPlacedTracks,
  });

  const audio = useGameAudio({
    composition,
    tracks,
    placedTracks: displayedPlacedTracks,
    currentTime,
    setCurrentTime,
  });

  const dialogueContent = useDialogueContent({
    parcours,
    currentStep: flow.currentStep,
    gamePhase: flow.gamePhase,
    dialogueIndex: flow.dialogueIndex,
    successDialogueIndex: flow.successDialogueIndex,
    lastAnswerId: flow.lastAnswerId,
  });

  useEffect(() => {
    if (!hasStarted || !composition) return;

    const tutorialSeen = localStorage.getItem(TUTORIAL_STORAGE_KEY) === "true";

    if (tutorialSeen) return;

    const timeout = setTimeout(() => {
      setTutorialMode("start");
    }, 0);

    return () => clearTimeout(timeout);
  }, [hasStarted, composition]);

  useEffect(() => {
    if (!["completed", "final"].includes(flow.gamePhase)) return;

    const timeout = setTimeout(() => {
      audio.pauseGlobalTimeline();
      setDialogueAudioStopSignal((prev) => prev + 1);
      wasPlayingBeforeDialogueAudioRef.current = false;
    }, 0);

    return () => clearTimeout(timeout);
  }, [audio, flow.gamePhase]);

  const stopDialogueAudio = () => {
    setDialogueAudioStopSignal((prev) => prev + 1);
    wasPlayingBeforeDialogueAudioRef.current = false;
  };

  const pauseGameAudio = () => {
    stopDialogueAudio();
    audio.pauseGlobalTimeline();
  };

  const handleDialogueAudioStart = () => {
    wasPlayingBeforeDialogueAudioRef.current = audio.isPlaying;

    if (audio.isPlaying) {
      setTimeout(() => {
        audio.pauseGlobalTimeline();
      }, 0);
    }
  };

  const handleDialogueAudioStop = () => {
    if (!wasPlayingBeforeDialogueAudioRef.current) return;

    audio.resumeGlobalTimeline();
    wasPlayingBeforeDialogueAudioRef.current = false;
  };

  const handleToggleGlobalPlay = () => {
    stopDialogueAudio();
    audio.toggleGlobalPlay();
  };

  const handleOpenComposerBio = () => {
    pauseGameAudio();

    flow.setBioModal({
      type: "composer",
      data: compositeur,
    });
  };

  const handleOpenInstrumentBio = (instrumentId) => {
    const instrumentBio = instrumentsData.find(
      (instrument) => instrument.id === instrumentId,
    );

    if (!instrumentBio) return;

    pauseGameAudio();

    flow.setBioModal({
      type: "instrument",
      data: instrumentBio,
    });
  };

  const handleCloseTutorial = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
    setTutorialMode(null);
  };

  const handleStartTutorial = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");

    audio.stopAllPreviews();
    audio.resetGlobalTimeline();

    setCurrentTime(0);
    setDraggedTrack(null);
    stopDialogueAudio();

    flow.handleReplay();

    setTutorialMode(null);
    setTutorialStepIndex(0);
    setTutorialTextIndex(0);
  };

  const handleOpenTutorial = () => {
    audio.stopAllPreviews();
    audio.resetGlobalTimeline();

    setCurrentTime(0);
    setDraggedTrack(null);
    stopDialogueAudio();

    flow.handleReplay();

    setTutorialMode("replay");
  };

  const handleNextTutorialStep = () => {
    audio.stopAllPreviews();

    if (isTutorialSceneStep) {
      audio.pauseGlobalTimeline();
      setCurrentTime(0);
    }

    const step = tutorialSteps[tutorialStepIndex];

    if (!step) {
      setTutorialStepIndex(null);
      setTutorialTextIndex(0);
      return;
    }

    const texts = step.texts || [step.text];
    const isLastText = tutorialTextIndex >= texts.length - 1;
    const isLastStep = tutorialStepIndex >= tutorialSteps.length - 1;

    if (!isLastText) {
      setTutorialTextIndex((prev) => prev + 1);
      return;
    }

    if (!isLastStep) {
      setTutorialStepIndex((prev) => prev + 1);
      setTutorialTextIndex(0);
      return;
    }

    setTutorialStepIndex(null);
    setTutorialTextIndex(0);
  };

  const handleSkipTutorial = () => {
    audio.stopAllPreviews();
    audio.pauseGlobalTimeline();

    setCurrentTime(0);
    setTutorialStepIndex(null);
    setTutorialTextIndex(0);
  };

  const getDroppedZone = (position) => {
    if (!position) return null;

    const zones = document.querySelectorAll(".instrumentZone");

    return Array.from(zones).find((zoneElement) => {
      const rect = zoneElement.getBoundingClientRect();

      return (
        position.x >= rect.left &&
        position.x <= rect.right &&
        position.y >= rect.top &&
        position.y <= rect.bottom
      );
    });
  };

  const handleDropTrack = (dropData) => {
    setDraggedTrack(null);

    if (flow.gamePhase !== "playing") return;
    if (!dropData?.track || !flow.currentStep) return;

    const { track, x, y } = dropData;

    if (track.locked || track.type === "label") return;
    if (flow.placedTracks.includes(track.id)) return;

    audio.stopAllPreviews();

    if (track.isTrap) {
      flow.setComposerMood("angry");
      flow.setGamePhase("trap");
      return;
    }

    const droppedZone = getDroppedZone({ x, y });

    if (!droppedZone) return;

    const zoneInstrumentId = droppedZone.dataset.instrumentId;

    flow.setLastAnswerId(track.id);

    if (
      track.id === zoneInstrumentId &&
      flow.currentStep.validAnswers.includes(track.id)
    ) {
      flow.handlePlaceTrack(track.id);
      flow.setSelectedInstrumentId(track.id);
      flow.setComposerMood("neutral");
      flow.setSuccessDialogueIndex(0);
      flow.setGamePhase("success");
      return;
    }

    flow.setComposerMood("angry");
    flow.setGamePhase("wrong");
  };

  const handleReplay = () => {
    audio.stopAllPreviews();
    audio.resetGlobalTimeline();

    setDraggedTrack(null);
    stopDialogueAudio();

    flow.handleReplay();
  };

  if (!composition || !compositeur || !parcours) {
    return <div>Composition introuvable.</div>;
  }

  if (!hasStarted) {
    return (
      <div className="loadingScreen">
        <div className="loadingScreen_content">
          <img
            src="/assets/images/ui/logos/Blanc.png"
            alt="Odyssée Symphonique"
            className="loadingScreen_logo"
          />

          <div className="loadingScreen_bar">
            <div className="loadingScreen_progress"></div>
          </div>

          <p>Chargement du jeu</p>
        </div>

        <div className="opacity-selection"></div>
      </div>
    );
  }

  return (
    <div
      className="game"
      style={{
        backgroundImage: `url(${composition.coverImage})`,
        backgroundSize: composition.coverStyle?.size || "cover",
        backgroundPosition: composition.coverStyle?.position || "center",
        backgroundRepeat: composition.coverStyle?.repeat || "no-repeat",
      }}
    >
      <Menu
        composition={composition}
        compositeur={compositeur}
        onOpenTutorial={handleOpenTutorial}
      />

      <div className="game_main">
        <div
          className={`game_left ${
            currentTutorialStep?.highlightClass === "tutorial-highlight-tracks"
              ? "tutorial-highlight"
              : ""
          }`}
        >
          <TrackPanel
            composition={composition}
            tracks={tracks}
            activePreviewId={audio.activePreviewId}
            onPlayPreview={audio.handlePlayPreview}
            draggedTrackId={draggedTrack?.track.id}
            onDragStart={(track, position) => {
              if (flow.gamePhase !== "playing") return;
              setDraggedTrack({ track, position });
            }}
            onDragMove={(position) => {
              setDraggedTrack((prev) => (prev ? { ...prev, position } : prev));
            }}
            onDragEnd={handleDropTrack}
            tutorialPhase={tutorialTrackPhase}
          />
        </div>

        <main
          className={`game_center ${
            currentTutorialStep?.highlightClass === "tutorial-highlight--scene"
              ? "tutorial-highlight tutorial-highlight--scene"
              : ""
          }`}
        >
          <div className="instrumentZones">
            {composition.instrumentZones?.map((zone) => {
              const instrument = composition.instruments.find(
                (item) => item.id === zone.instrumentId,
              );

              return (
                <InstrumentZone
                  key={zone.id}
                  zone={zone}
                  instrument={instrument}
                  isPlaced={displayedPlacedTracks.includes(zone.instrumentId)}
                  showInfo={displayedSelectedInstrumentId === zone.instrumentId}
                  onSelect={flow.setSelectedInstrumentId}
                  volume={audio.getInstrumentVolume(zone.instrumentId)}
                  isMuted={audio.isInstrumentMuted(zone.instrumentId)}
                  onToggleMute={() =>
                    audio.handleToggleInstrumentMute(zone.instrumentId)
                  }
                  onChangeVolume={(volume) =>
                    audio.handleChangeInstrumentVolume(
                      zone.instrumentId,
                      volume,
                    )
                  }
                  onOpenInstrument={() =>
                    handleOpenInstrumentBio(zone.instrumentId)
                  }
                />
              );
            })}
          </div>
        </main>
      </div>

      <div className="game_bottom">
        <div
          className={
            currentTutorialStep?.highlightClass === "tutorial-highlight-timer"
              ? "tutorial-highlight"
              : ""
          }
        >
          <TimerRewardsPanel
            duration={composition.duration}
            currentTime={Math.floor(currentTime)}
            isPlaying={audio.isPlaying}
            onTogglePlay={handleToggleGlobalPlay}
            compositionId={composition.id}
          />
        </div>

        <div
          className={
            currentTutorialStep?.highlightClass ===
            "tutorial-highlight-dialogue"
              ? "tutorial-highlight"
              : ""
          }
        >
          <DialogueBox
            compositeur={compositeur}
            content={dialogueContent}
            onNext={
              isTutorialRunning
                ? undefined
                : ["intro", "success", "wrong", "trap", "completed"].includes(
                      flow.gamePhase,
                    )
                  ? flow.handleNextDialogue
                  : undefined
            }
            showContinueHint={[
              "intro",
              "success",
              "wrong",
              "trap",
              "completed",
            ].includes(flow.gamePhase)}
            onAudioReferenceStart={handleDialogueAudioStart}
            onAudioReferenceStop={handleDialogueAudioStop}
            stopAudioSignal={dialogueAudioStopSignal}
          />
        </div>

        <div
          className={
            currentTutorialStep?.highlightClass ===
            "tutorial-highlight-composer"
              ? "tutorial-highlight"
              : ""
          }
        >
          <ComposerPanel
            compositeur={compositeur}
            mood={flow.composerMood}
            onOpenBio={handleOpenComposerBio}
          />
        </div>
      </div>

      {draggedTrack && (
        <div
          className="dragGhost"
          style={{
            left: draggedTrack.position.x,
            top: draggedTrack.position.y,
          }}
        >
          <TrackCard
            track={draggedTrack.track}
            isActive={false}
            onPlayPreview={() => {}}
            onDragStart={() => {}}
            onDragMove={() => {}}
            onDragEnd={() => {}}
            isGhost
          />
        </div>
      )}

      {tutorialMode && (
        <Tutorial
          mode={tutorialMode}
          onClose={handleCloseTutorial}
          onStart={handleStartTutorial}
        />
      )}

      {tutorialStepIndex !== null && (
        <TutorialOverlay
          stepIndex={tutorialStepIndex}
          textIndex={tutorialTextIndex}
          onNext={handleNextTutorialStep}
          onSkip={handleSkipTutorial}
        />
      )}

      {flow.bioModal && (
        <BioModal
          type={flow.bioModal.type}
          data={flow.bioModal.data}
          onClose={() => flow.setBioModal(null)}
        />
      )}

      {flow.gamePhase === "final" && (
        <VictoryScreen
          rewards={composition.rewards || []}
          recommendations={composition.recommendations || []}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
}

export default Game;
