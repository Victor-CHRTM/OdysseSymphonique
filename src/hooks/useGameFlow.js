import { useState } from "react";

function useGameFlow({ parcours }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [placedTracks, setPlacedTracks] = useState([]);

  const [gamePhase, setGamePhase] = useState("intro");
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [successDialogueIndex, setSuccessDialogueIndex] = useState(0);
  const [lastAnswerId, setLastAnswerId] = useState(null);

  const [composerMood, setComposerMood] = useState("neutral");
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(null);
  const [bioModal, setBioModal] = useState(null);

  const currentStep = parcours?.steps?.[currentStepIndex];

  const handlePlaceTrack = (trackId) => {
    setPlacedTracks((prev) => {
      if (prev.includes(trackId)) return prev;
      return [...prev, trackId];
    });
  };

  const handleNextDialogue = () => {
    if (!parcours) return;

    if (gamePhase === "intro") {
      const isLastDialogue =
        dialogueIndex >= parcours.openingDialogues.length - 1;

      if (isLastDialogue) {
        setGamePhase("playing");
        setDialogueIndex(0);
        return;
      }

      setDialogueIndex((prev) => prev + 1);
      return;
    }

    if (!currentStep) return;

    if (gamePhase === "success") {
      const choice = currentStep.choices.find(
        (choice) => choice.instrumentId === lastAnswerId,
      );

      const successDialogues = choice?.successDialogues || [];

      if (successDialogues.length > 0) {
        const isLastSuccessDialogue =
          successDialogueIndex >= successDialogues.length - 1;

        if (!isLastSuccessDialogue) {
          setSuccessDialogueIndex((prev) => prev + 1);
          return;
        }
      }

      const updatedPlacedTracks = [...new Set([...placedTracks, lastAnswerId])];

      const isStepComplete = currentStep.validAnswers.every((answerId) =>
        updatedPlacedTracks.includes(answerId),
      );

      setSuccessDialogueIndex(0);

      if (!isStepComplete) {
        setGamePhase("playing");
        setComposerMood("neutral");
        return;
      }

      const nextStepIndex = currentStepIndex + 1;

      if (nextStepIndex >= parcours.steps.length) {
        setGamePhase("completed");
        setComposerMood("neutral");
        setSelectedInstrumentId(null);
        return;
      }

      setCurrentStepIndex(nextStepIndex);
      setGamePhase("playing");
      setComposerMood("neutral");
      setSelectedInstrumentId(null);
      return;
    }

    if (gamePhase === "completed") {
      setGamePhase("final");
      return;
    }

    if (gamePhase === "trap" || gamePhase === "wrong") {
      setGamePhase("playing");
      setComposerMood("neutral");
    }
  };

  const handleReplay = () => {
    setCurrentStepIndex(0);
    setPlacedTracks([]);

    setGamePhase("intro");
    setDialogueIndex(0);
    setSuccessDialogueIndex(0);
    setLastAnswerId(null);

    setComposerMood("neutral");
    setSelectedInstrumentId(null);
    setBioModal(null);
  };

  return {
    currentStep,
    currentStepIndex,

    placedTracks,
    setPlacedTracks,

    gamePhase,
    setGamePhase,

    dialogueIndex,
    setDialogueIndex,

    successDialogueIndex,
    setSuccessDialogueIndex,

    lastAnswerId,
    setLastAnswerId,

    composerMood,
    setComposerMood,

    selectedInstrumentId,
    setSelectedInstrumentId,

    bioModal,
    setBioModal,

    handlePlaceTrack,
    handleNextDialogue,
    handleReplay,
  };
}

export default useGameFlow;
