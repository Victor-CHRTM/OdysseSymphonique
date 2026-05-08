function Tutorial({ mode = "start", onClose, onStart }) {
  const title =
    mode === "replay" ? "Revoir le tutoriel ?" : "Faire le tutoriel ?";

  const startLabel = mode === "replay" ? "Revoir" : "Commencer";

  return (
    <div className="tutorial">
      <div className="tutorial_card">
        <div className="tutorial_icon">?</div>

        <p className="tutorial_title">{title}</p>

        <div className="tutorial_actions">
          <button type="button" className="tutorial_close" onClick={onClose}>
            Fermer
          </button>

          <button type="button" className="tutorial_start" onClick={onStart}>
            {startLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Tutorial;
