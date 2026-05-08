import { useMemo } from "react";

function useDialogueContent({
  parcours,
  currentStep,
  gamePhase,
  dialogueIndex,
  successDialogueIndex,
  lastAnswerId,
}) {
  return useMemo(() => {
    if (!parcours || !currentStep) return [];

    if (gamePhase === "intro") {
      return parcours.openingDialogues[dialogueIndex].content;
    }

    if (gamePhase === "success") {
      const choice = currentStep.choices.find(
        (choice) => choice.instrumentId === lastAnswerId,
      );

      if (choice?.successDialogues?.length) {
        return choice.successDialogues[successDialogueIndex]?.content || [];
      }

      return [
        {
          type: "text",
          text: choice?.successText,
        },
        ...(choice?.content || []),
      ];
    }

    if (gamePhase === "trap") {
      return [
        {
          type: "text",
          text: currentStep.trapText,
        },
      ];
    }

    if (gamePhase === "wrong") {
      const choice = currentStep.choices.find(
        (choice) => choice.instrumentId === lastAnswerId,
      );

      return [
        {
          type: "text",
          text:
            choice?.hintText ||
            "Ce n'est pas le bon instrument. Réessaie avec une autre zone.",
        },
      ];
    }

    if (gamePhase === "completed") {
      return [
        {
          type: "text",
          text: parcours.finalScreen?.text,
        },
        {
          type: "finalAction",
        },
      ];
    }

    return [
      {
        type: "text",
        text: "Écoute une piste sonore, puis glisse-la sur le bon instrument.\n Vite, le requin arrive !!",
      },
    ];
  }, [
    parcours,
    currentStep,
    gamePhase,
    dialogueIndex,
    successDialogueIndex,
    lastAnswerId,
  ]);
}

export default useDialogueContent;
