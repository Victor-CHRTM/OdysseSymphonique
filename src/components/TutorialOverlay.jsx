import tutorialSteps from "../data/tutorial.json";

function TutorialOverlay({ stepIndex = 0, textIndex = 0, onNext, onSkip }) {
  const step = tutorialSteps[stepIndex];

  if (!step) return null;

  const texts = step.texts || [step.text];
  const currentText = texts[textIndex];

  const isLastStep = stepIndex >= tutorialSteps.length - 1;
  const isLastText = textIndex >= texts.length - 1;

  const handleContinue = () => {
    if (isLastStep && isLastText) {
      onSkip();
      return;
    }

    onNext();
  };

  return (
    <div
      onClick={handleContinue}
      className={`tutorialOverlay ${
        step.highlightClass === "tutorial-highlight--scene"
          ? "tutorialOverlay--sceneFocus"
          : ""
      }`}
    >
      <button
        type="button"
        className="tutorialOverlay_skip"
        onClick={(event) => {
          event.stopPropagation();
          onSkip();
        }}
      >
        Passer le tutoriel
        <img src="/assets/images/ui/game/skip-tuto.png" alt="" />
      </button>

      <div
        className="tutorialOverlay_bubble"
        style={{
          top: step.bubblePosition?.top,
          left: step.bubblePosition?.left || "25%",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <p>{currentText}</p>

        <button type="button" onClick={handleContinue}>
          <img src="/assets/images/ui/game/next-tuto.png" alt="Suivant" />
        </button>
      </div>
    </div>
  );
}

export default TutorialOverlay;
